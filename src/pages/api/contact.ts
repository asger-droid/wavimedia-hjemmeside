import type { APIRoute } from 'astro';

// Runs on Vercel as a function. Everything else on the site is static.
export const prerender = false;

/*
  Environment variables (Vercel > Project > Settings > Environment Variables):
  RESEND_API_KEY      required for email. From resend.com.
  CONTACT_TO          where leads go. Default: hello@wavimedia.com
  CONTACT_FROM        sender. Default: "Wavi website <onboarding@resend.dev>" (works before the domain is verified,
                      but then Resend only delivers to the email address on the Resend account).
  SLACK_WEBHOOK_URL   optional. When set, every lead is also posted to Slack. No code change needed.
*/

const env = (key: string): string | undefined => process.env[key] ?? (import.meta.env as Record<string, string | undefined>)[key];

const REQUIRED = ['name', 'email', 'website', 'phone', 'region'] as const;
const LABELS: Record<string, string> = {
  name: 'Name', email: 'Email', website: 'Website', phone: 'Phone', region: 'Based in',
  revenue: 'Monthly revenue', help: 'Needs help with', message: 'Where growth stalls'
};

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const clean = (v: unknown, max = 2000) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export const POST: APIRoute = async ({ request }) => {
  let data: Record<string, unknown>;
  try { data = await request.json(); } catch { return json(400, { ok: false, error: 'invalid_body' }); }

  // Honeypot: real visitors never see this field. Pretend success so bots learn nothing.
  if (clean(data.company_site)) return json(200, { ok: true });

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
    if (res?.ok) delivered = true;
    else console.error('Resend failed', res?.status, await res?.text().catch(() => ''));
  }

  if (slack) {
    const res = await fetch(slack, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: `*${subject}*\n${rows.map(([k, v]) => `*${k}:* ${v}`).join('\n')}` })
    }).catch(() => null);
    if (res?.ok) delivered = true;
    else console.error('Slack failed', res?.status);
  }

  return delivered ? json(200, { ok: true }) : json(502, { ok: false, error: 'delivery_failed' });
};
