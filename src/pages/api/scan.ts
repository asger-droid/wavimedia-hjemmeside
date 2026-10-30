import type { APIRoute } from 'astro';
import { analyze, detectPlatform, gtmIds, normalizeUrl, type Check } from '../../lib/scan';
import { safeFetch } from '../../lib/fetch';

// Runs on Vercel as a function. GET /api/scan?url=yourbrand.com
// Tracking checks only (a few seconds). Mobile speed is measured separately by /api/speed.
export const prerender = false;

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36 WaviStoreScan/1.0 (+https://wavimedia.com/tools/store-scan)';
const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

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
  const gtmCode = (await Promise.all(ids.map(gtmContainer))).join('\n');
  const checks: Check[] = analyze(page.text, gtmCode);
  const summary = { ok: 0, warn: 0, bad: 0, info: 0 };
  checks.forEach((c) => summary[c.status]++);

  console.log('Store scan:', page.url.hostname, JSON.stringify(summary));
  return json(200, { ok: true, domain: page.url.hostname.replace(/^www\./, ''), finalUrl: page.url.href, platform: detectPlatform(page.text), checks, summary, scannedAt: new Date().toISOString() });
};
