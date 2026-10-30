import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { isPrivateIp } from './scan';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36 WaviStoreScan/1.0 (+https://wavimedia.com/tools/store-scan)';

export async function assertPublic(host: string) {
  const ips = isIP(host) ? [host] : (await lookup(host, { all: true })).map((r) => r.address);
  if (!ips.length || ips.some(isPrivateIp)) throw new Error('blocked_host');
}

// Fetches a public page: checks every redirect hop, caps time and size.
export async function safeFetch(start: URL, timeoutMs = 9000, maxBytes = 3_000_000): Promise<{ url: URL; status: number; text: string }> {
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
