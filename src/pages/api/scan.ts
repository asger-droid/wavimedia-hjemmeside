import type { APIRoute } from 'astro';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { analyze, detectPlatform, gtmIds, isPrivateIp, normalizeUrl, type Check, type Speed } from '../../lib/scan';

// Runs on Vercel as a function. GET /api/scan?url=yourbrand.com
export const prerender = false;

/*
  Optional environment variable:
  PAGESPEED_API_KEY   Google PageSpeed Insights key (free, Google Cloud). Without it Google's shared quota is used,
                      which can run out; the report then says speed couldn't be measured instead of guessing.
*/

const env = (key: string): string | undefined => process.env[key] ?? (import.meta.env as Record<string, string | undefined>)[key];
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36 WaviStoreScan/1.0 (+https://wavimedia.com/tools/store-scan)';
const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

async function assertPublic(host: string) {
  const ips = isIP(host) ? [host] : (await lookup(host, { all: true })).map((r) => r.address);
  if (!ips.length || ips.some(isPrivateIp)) throw new Error('blocked_host');
}

// Fetches a public page: checks every redirect hop, caps time and size.
async function safeFetch(start: URL, timeoutMs = 9000, maxBytes = 3_000_000): Promise<{ url: URL; status: number; text: string }> {
  let url = start;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    for (let hop = 0; hop < 6; hop++) {
      await assertPublic(url.hostname);
      const res = await fetch(url, { redirect: 'manual', signal: ctrl.signal, headers: { 'User-Agent': UA, Accept: 'text/html,*/*;q=0.8', 'Accept-Language': 'en,da;q=0.8' } });
      if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
        url = new URL(res.headers.get('location')!, url);
        if (!['http:', 'https:'].includes(url.protocol)) throw new Error('bad_redirect');
        continue;
      }
      const reader = res.body?.getReader();
      let text = '', size = 0;
      const dec = new TextDecoder();
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length; text += dec.decode(value, { stream: true });
        if (size > maxBytes) { await reader.cancel(); break; }
      }
      return { url, status: res.status, text };
    }
    throw new Error('too_many_redirects');
  } finally { clearTimeout(timer); }
}

async function pageSpeed(url: string): Promise<Speed | null> {
  const key = env('PAGESPEED_API_KEY');
  const api = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&category=performance${key ? `&key=${key}` : ''}`;
  try {
    const res = await fetch(api, { signal: AbortSignal.timeout(45000) });
    if (!res.ok) { console.warn('Store scan: PageSpeed unavailable', res.status); return null; }
    const d = await res.json();
    const score = d?.lighthouseResult?.categories?.performance?.score;
    const lcp = d?.lighthouseResult?.audits?.['largest-contentful-paint']?.numericValue;
    return typeof score === 'number' && typeof lcp === 'number' ? { score: Math.round(score * 100), lcpMs: lcp } : null;
  } catch (e) { console.warn('Store scan: PageSpeed failed', String(e)); return null; }
}

async function gtmContainer(id: string): Promise<string> {
  try {
    const res = await fetch(`https://www.googletagmanager.com/gtm.js?id=${id}`, { signal: AbortSignal.timeout(6000), headers: { 'User-Agent': UA } });
    return res.ok ? (await res.text()).slice(0, 3_000_000) : '';
  } catch { return ''; }
}

export const GET: APIRoute = async ({ url }) => {
  const target = normalizeUrl(url.searchParams.get('url') ?? '');
  if (!target) return json(400, { ok: false, error: 'invalid_url', message: 'Enter a store address like yourbrand.com.' });

  let page: Awaited<ReturnType<typeof safeFetch>>;
  try {
    try {
      page = await safeFetch(target);
    } catch (e) {
      // People type www. for stores that only answer without it, and the other way round. Try the other variant once.
      if (!/ENOTFOUND|EAI_AGAIN/.test(String((e as Error)?.message ?? e))) throw e;
      const h = target.hostname;
      page = await safeFetch(new URL(`${target.protocol}//${h.startsWith('www.') ? h.slice(4) : `www.${h}`}/`));
    }
  } catch (e) {
    const msg = String((e as Error)?.message ?? e);
    console.warn('Store scan: fetch failed', target.hostname, msg);
    if (msg === 'blocked_host') return json(400, { ok: false, error: 'invalid_url', message: 'That address can\u2019t be scanned.' });
    if (/ENOTFOUND|EAI_AGAIN/.test(msg)) return json(404, { ok: false, error: 'not_found', message: `We couldn\u2019t find ${target.hostname}. Check the spelling.` });
    return json(502, { ok: false, error: 'unreachable', message: `We couldn\u2019t reach ${target.hostname} right now. Try again in a minute.` });
  }
  if (page.status >= 400 || page.text.length < 200) {
    console.warn('Store scan: store refused', target.hostname, page.status);
    return json(502, { ok: false, error: 'blocked', message: `${target.hostname} didn\u2019t let our scanner in (status ${page.status}). Some stores block automated visits. Book a session and we\u2019ll check it by hand.` });
  }

  const ids = gtmIds(page.text);
  const [gtmCode, speed] = await Promise.all([Promise.all(ids.map(gtmContainer)).then((a) => a.join('\n')), pageSpeed(page.url.href)]);
  const checks: Check[] = analyze(page.text, gtmCode, speed);
  const summary = { ok: 0, warn: 0, bad: 0, info: 0 };
  checks.forEach((c) => summary[c.status]++);

  console.log('Store scan:', page.url.hostname, JSON.stringify(summary));
  return json(200, { ok: true, domain: page.url.hostname.replace(/^www\./, ''), platform: detectPlatform(page.text), checks, summary, scannedAt: new Date().toISOString() });
};
