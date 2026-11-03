import type { APIRoute } from 'astro';
import { createHash, randomUUID } from 'node:crypto';
import { META_PIXEL_ID, META_API_VERSION } from '../../data/tracking';

// Runs on Vercel as a function. Everything else on the site is static.
export const prerender = false;

/*
  Environment variables (Vercel > Project > Settings > Environment Variables):
  RESEND_API_KEY      required for email. From resend.com.
  CONTACT_TO          where leads go. Default: hello@wavimedia.com
  CONTACT_FROM        sender. Default: "Wavi website <onboarding@resend.dev>" (works before the domain is verified,
                      but then Resend only delivers to the email address on the Resend account).
  SLACK_WEBHOOK_URL   optional. When set, every lead is also posted to Slack. No code change needed.
  META_CAPI_TOKEN     optional. Conversions API access token from Meta Events Manager. When set, every delivered lead is
                      also sent to Meta as a Lead event (hashed email/phone/name), matched to the browser Lead by event_id.
  META_TEST_EVENT_CODE optional. Meta's test code, to see events under Test Events while checking the setup.
*/

const env = (key: string): string | undefined => process.env[key] ?? (import.meta.env as Record<string, string | undefined>)[key];

// Phone is optional: asking for it loses leads, and the reply goes out by email anyway.
const REQUIRED = ['name', 'email', 'website', 'region'] as const;
const LABELS: Record<string, string> = {
  name: 'Name', email: 'Email', website: 'Website', phone: 'Phone', region: 'Based in',
  revenue: 'Monthly revenue', help: 'Needs help with', message: 'Where growth stalls'
};

// Meta requires customer data hashed with SHA-256 after trimming and lowercasing.
const sha = (v: string) => createHash('sha256').update(v.trim().toLowerCase()).digest('hex');

async function sendMetaLead(request: Request, lead: Record<string, string>, eventId: string) {
  const token = env('META_CAPI_TOKEN');
  if (!token) return;
  const cookies = Object.fromEntries((request.headers.get('cookie') ?? '').split(';').map((c) => c.trim().split('=')).filter(([k]) => k).map(([k, ...v]) => [k, v.join('=')]));
  const names = lead.name.split(/\s+/).filter(Boolean);
  const digits = lead.phone.replace(/\D/g, '');
  const user_data: Record<string, unknown> = {
    em: [sha(lead.email)],
    ph: digits ? [sha(digits)] : undefined,
    fn: names.length ? [sha(names[0])] : undefined,
    ln: names.length > 1 ? [sha(names[names.length - 1])] : undefined,
    client_ip_address: (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || undefined,
    client_user_agent: request.headers.get('user-agent') ?? undefined,
    fbp: cookies._fbp, fbc: cookies._fbc
  };
  const payload: Record<string, unknown> = {
    data: [{ event_name: 'Lead', event_time: Math.floor(Date.now() / 1000), event_id: eventId, action_source: 'website',
      event_source_url: request.headers.get('referer') ?? 'https://wavimedia.com/contact', user_data, custom_data: { content_name: 'Growth session request' } }]
  };
  if (env('META_TEST_EVENT_CODE')) payload.test_event_code = env('META_TEST_EVENT_CODE');
  const url = `${env('META_CAPI_URL') ?? `https://graph.facebook.com/${META_API_VERSION}/${META_PIXEL_ID}/events`}?access_token=${encodeURIComponent(token)}`;
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: AbortSignal.timeout(4000) }).catch(() => null);
  if (res?.ok) console.log('Contact form: Lead sent to Meta Conversions API', await res.text().catch(() => ''));
  else console.error('Meta Conversions API failed', res?.status, await res?.text().catch(() => ''));
}

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const clean = (v: unknown, max = 2000) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export const POST: APIRoute = async ({ request }) => {
  let data: Record<string, unknown>;
  try { data = await request.json(); } catch { return json(400, { ok: false, error: 'invalid_body' }); }

  // Honeypot: real visitors never see this field. Named so browser autofill and password managers leave it alone.
  // Pretend success so bots learn nothing, but log it so a false positive is visible in Vercel logs.
  if (clean(data.wv_hp)) { console.warn('Contact form: honeypot triggered, lead not sent', { email: clean(data.email, 200) }); return json(200, { ok: true }); }

  const lead: Record<string, string> = {};
  for (const key of Object.keys(LABELS)) {
    const raw = data[key];
    lead[key] = Array.isArray(raw) ? raw.map((x) => clean(x, 60)).join(', ') : clean(raw, key === 'message' ? 4000 : 300);
  }
  const missing = REQUIRED.filter((k) => !lead[k]);
  if (missing.length) return json(400, { ok: false, error: 'missing_fields', fields: missing });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) return json(400, { ok: false, error: 'invalid_email', fields: ['email'] });

  const apiKey = env('RESEND_API_KEY');
  const slack = env('SLACK_WEBHOOK_URL');
  if (!apiKey && !slack) return json(503, { ok: false, error: 'not_configured' });

  const rows = Object.keys(LABELS).filter((k) => lead[k]).map((k) => [LABELS[k], lead[k]] as const);
  const subject = `New growth session request: ${lead.name} (${lead.website})`;
  let delivered = false;

  if (apiKey) {
    const html = `<h2 style="font-family:Georgia,serif;font-weight:500">${escapeHtml(subject)}</h2><table cellpadding="6" style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">${rows.map(([k, v]) => `<tr><td style="color:#57544E;vertical-align:top">${escapeHtml(k)}</td><td>${escapeHtml(v)}</td></tr>`).join('')}</table>`;
    const res = await fetch(env('RESEND_API_URL') ?? 'https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env('CONTACT_FROM') ?? 'Wavi website <onboarding@resend.dev>',
        to: (env('CONTACT_TO') ?? 'hello@wavimedia.com').split(',').map((s) => s.trim()),
        reply_to: lead.email,
        subject,
        html,
        text: rows.map(([k, v]) => `${k}: ${v}`).join('\n')
      })
    }).catch(() => null);
    if (res?.ok) { delivered = true; console.log('Contact form: email accepted by Resend', await res.text().catch(() => '')); }
    else console.error('Resend failed', res?.status, await res?.text().catch(() => ''));
  }

  if (slack) {
    const res = await fetch(slack, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: `*${subject}*\n${rows.map(([k, v]) => `*${k}:* ${v}`).join('\n')}` })
    }).catch(() => null);
    if (res?.ok) { delivered = true; console.log('Contact form: posted to Slack'); }
    else console.error('Slack failed', res?.status);
  }

  // Only a lead that actually reached us counts as a Lead in Meta. A Meta hiccup never fails the form.
  if (delivered) await sendMetaLead(request, lead, clean(data.event_id, 64) || randomUUID()).catch(() => {});
  return delivered ? json(200, { ok: true }) : json(502, { ok: false, error: 'delivery_failed' });
};
