import type { APIRoute } from 'astro';
import { normalizeUrl, speedCheck, type Speed } from '../../lib/scan';
import { assertPublic } from '../../lib/fetch';

// Runs on Vercel as a function. GET /api/speed?url=https://yourbrand.com/
// Google PageSpeed Insights (mobile). Heavy stores can take close to a minute, so this runs on its own
// and the report shows the tracking checks while it waits.
export const prerender = false;

/*
  PAGESPEED_API_KEY   Google PageSpeed Insights key (free, Google Cloud). Without it Google's shared quota is used,
                      which runs out quickly; the report then says speed couldn't be measured instead of guessing.
*/
const env = (key: string): string | undefined => process.env[key] ?? (import.meta.env as Record<string, string | undefined>)[key];
const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

export const GET: APIRoute = async ({ url }) => {
  const raw = url.searchParams.get('url') ?? '';
  const target = normalizeUrl(raw);
  if (!target) return json(400, { ok: false, error: 'invalid_url' });
  // Keep the path the scan ended on (e.g. a regional homepage), but only on the validated host.
  let page = target.href;
  try { const u = new URL(raw); if (u.hostname === target.hostname) page = `${target.origin}${u.pathname}`; } catch { /* use homepage */ }
  try { await assertPublic(target.hostname); } catch { return json(400, { ok: false, error: 'invalid_url' }); }

  const key = env('PAGESPEED_API_KEY');
  const api = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(page)}&strategy=mobile&category=performance${key ? `&key=${key}` : ''}`;
  const started = Date.now();
  let speed: Speed | null = null;
  try {
    const res = await fetch(api, { signal: AbortSignal.timeout(100_000) });
    if (res.ok) {
      const d = await res.json();
      const score = d?.lighthouseResult?.categories?.performance?.score;
      const lcp = d?.lighthouseResult?.audits?.['largest-contentful-paint']?.numericValue;
      if (typeof score === 'number' && typeof lcp === 'number') speed = { score: Math.round(score * 100), lcpMs: lcp };
      else console.warn('Store scan speed: no score in response', target.hostname, d?.lighthouseResult?.runtimeError?.code ?? '');
    } else {
      const body = await res.text().catch(() => '');
      console.warn('Store scan speed: PageSpeed error', res.status, body.slice(0, 300));
    }
  } catch (e) { console.warn('Store scan speed: PageSpeed failed', String(e)); }

  console.log('Store scan speed:', target.hostname, speed ? `score ${speed.score}, LCP ${(speed.lcpMs / 1000).toFixed(1)}s` : 'not measured', `${((Date.now() - started) / 1000).toFixed(1)}s`);
  return json(200, { ok: true, check: speedCheck(speed) });
};
