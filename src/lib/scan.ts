/*
  Store scan analysis. Pure functions: given the store's HTML (plus any Google Tag Manager container code),
  report only what can actually be seen from outside. Nothing is estimated or invented.
*/

export type Status = 'ok' | 'warn' | 'bad' | 'info';
export interface Check { id: string; name: string; status: Status; note: string }
export interface Speed { score: number; lcpMs: number }

const uniq = (a: string[]) => Array.from(new Set(a));
const all = (re: RegExp, s: string, group = 1) => uniq(Array.from(s.matchAll(re), (m) => m[group]).filter(Boolean));

const CMPS: [string, RegExp][] = [
  ['Cookiebot', /consent\.cookiebot\.com|Cookiebot/],
  ['Cookie Information', /cookieinformation\.com|CookieInformation/i],
  ['OneTrust', /cdn\.cookielaw\.org|otSDKStub|OneTrust/],
  ['Usercentrics', /usercentrics/i],
  ['CookieYes', /cookieyes/i],
  ['Didomi', /didomi/i],
  ['iubenda', /iubenda/i],
  ['Pandectes', /pandectes/i],
  ['Consentmo', /consentmo|gdpr-legal-cookie/i],
  ['Complianz', /complianz/i],
  ['CookieScript', /cookie-script\.com/i]
];

export function detectPlatform(html: string): string {
  if (/cdn\.shopify\.com|Shopify\.theme|shopify-section/.test(html)) return 'Shopify';
  if (/wp-content\/plugins\/woocommerce|woocommerce/i.test(html)) return 'WooCommerce';
  if (/Magento|mage\/cookies/.test(html)) return 'Magento';
  if (/static\.wixstatic\.com|wix\.com/.test(html)) return 'Wix';
  if (/squarespace\.com|static1\.squarespace/.test(html)) return 'Squarespace';
  if (/bigcommerce\.com/.test(html)) return 'BigCommerce';
  return '';
}

export const gtmIds = (html: string) => all(/\b(GTM-[A-Z0-9]{4,9})\b/g, html).slice(0, 3);

export function analyze(html: string, gtmCode = ''): Check[] {
  const hay = html + '\n' + gtmCode;
  const inGtmOnly = (re: RegExp) => !re.test(html) && re.test(gtmCode);
  const checks: Check[] = [];

  // Meta Pixel
  const fbIds = all(/fbq\(\s*['"]init['"]\s*,\s*['"](\d{8,20})/g, hay);
  const fbScript = /connect\.facebook\.net\/[^"'\s]*fbevents\.js|fbq\(/;
  const shopifyPixels = (html.split('webPixelsConfigList')[1] ?? '').slice(0, 30000);
  const fbViaShopify = /facebook/i.test(shopifyPixels);
  if (fbIds.length || fbScript.test(hay)) {
    const where = inGtmOnly(fbScript) ? ' (loaded through Google Tag Manager)' : '';
    checks.push({ id: 'meta-pixel', name: 'Meta Pixel', status: 'ok', note: fbIds.length ? `Pixel ${fbIds.join(', ')} found${where}.` : `Meta Pixel script found${where}.` });
  } else if (fbViaShopify) {
    checks.push({ id: 'meta-pixel', name: 'Meta Pixel', status: 'ok', note: 'Connected through Shopify\u2019s Facebook & Instagram app.' });
  } else {
    checks.push({ id: 'meta-pixel', name: 'Meta Pixel', status: 'bad', note: 'No Meta Pixel found on the homepage or in Tag Manager.' });
  }

  // Meta Conversions API: server to server, so it cannot be observed from outside.
  checks.push({ id: 'meta-capi', name: 'Meta Conversions API', status: 'info', note: 'Server-side events can\u2019t be seen from outside the store. We verify them in the senior audit.' });

  // Google tags
  const ga4 = all(/\b(G-[A-Z0-9]{6,12})\b/g, hay), ads = all(/\b(AW-\d{6,12})\b/g, hay), gtm = gtmIds(html);
  if (ga4.length || ads.length || gtm.length) {
    const parts = [ga4.length && `GA4 ${ga4.join(', ')}`, ads.length && `Google Ads ${ads.join(', ')}`, gtm.length && `Tag Manager ${gtm.join(', ')}`].filter(Boolean);
    const note = `Found: ${parts.join(' \u00b7 ')}.` + (ads.length ? '' : ' No Google Ads conversion tag (AW-) in the page or Tag Manager.');
    checks.push({ id: 'google', name: 'Google tag', status: ads.length || !ga4.length ? 'ok' : 'warn', note });
  } else {
    checks.push({ id: 'google', name: 'Google tag', status: 'bad', note: 'No Google Analytics, Google Ads or Tag Manager found.' });
  }

  // Consent
  const cmps = CMPS.filter(([, re]) => re.test(hay)).map(([n]) => n);
  const consentMode = /gtag\(\s*['"]consent['"]\s*,\s*['"]default['"]|setDefaultConsentState|["']consent["']\s*,\s*["']default["']|ads_data_redaction/.test(hay);
  const shopifyPrivacy = /customerPrivacy|consent-tracking-api|privacy-banner/.test(html);
  if (cmps.length && consentMode) checks.push({ id: 'consent', name: 'Consent banner & Consent Mode', status: 'ok', note: `${cmps.join(', ')} with Google Consent Mode signals.` });
  else if (cmps.length) checks.push({ id: 'consent', name: 'Consent banner & Consent Mode', status: 'warn', note: `${cmps.join(', ')} found, but no Google Consent Mode signals in the page or Tag Manager.` });
  else if (consentMode) checks.push({ id: 'consent', name: 'Consent banner & Consent Mode', status: 'warn', note: `Consent Mode signals found, but no known consent banner${shopifyPrivacy ? ' (Shopify\u2019s own privacy banner may be in use)' : ''}.` });
  else checks.push({ id: 'consent', name: 'Consent banner & Consent Mode', status: 'warn', note: shopifyPrivacy ? 'Only Shopify\u2019s customer privacy API found. No Google Consent Mode signals.' : 'No consent banner or Consent Mode signals found on the homepage.' });

  // Klaviyo
  const kl = all(/klaviyo\.js\?company_id=([A-Za-z0-9]{6})/g, hay);
  if (kl.length || /static\.klaviyo\.com|klaviyo\.js|_learnq/.test(hay)) checks.push({ id: 'klaviyo', name: 'Klaviyo onsite tracking', status: 'ok', note: kl.length ? `Klaviyo onsite script found (account ${kl[0]}).` : 'Klaviyo onsite script found.' });
  else checks.push({ id: 'klaviyo', name: 'Klaviyo onsite tracking', status: 'info', note: 'Not detected. Fine if you don\u2019t use Klaviyo.' });

  // TikTok
  const tt = all(/ttq\.load\(\s*['"]([A-Z0-9]{10,})['"]/g, hay);
  if (tt.length || /analytics\.tiktok\.com/.test(hay)) checks.push({ id: 'tiktok', name: 'TikTok Pixel', status: 'ok', note: tt.length ? `Pixel ${tt.join(', ')} found.` : 'TikTok Pixel script found.' });
  else checks.push({ id: 'tiktok', name: 'TikTok Pixel', status: 'info', note: 'Not detected. Fine if you don\u2019t advertise on TikTok.' });

  return checks;
}

// Mobile speed (Google PageSpeed Insights, mobile, lab data). Measured separately because Google can take up to a minute.
export function speedCheck(speed: Speed | null): Check {
  if (!speed) return { id: 'speed', name: 'Mobile page speed', status: 'info', note: 'Google couldn\u2019t measure this page right now. Try again in a minute.' };
  const lcp = speed.lcpMs / 1000;
  const status: Status = lcp <= 2.5 ? 'ok' : lcp <= 4 ? 'warn' : 'bad';
  return { id: 'speed', name: 'Mobile page speed', status, note: `Largest content appears after ${lcp.toFixed(1)} s on mobile. PageSpeed score ${speed.score}/100.` };
}

/* ---------- network safety: only public http(s) hosts may be fetched ---------- */

export function normalizeUrl(input: string): URL | null {
  const raw = input.trim();
  if (!raw || raw.length > 300) return null;
  try {
    const u = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    if (!['http:', 'https:'].includes(u.protocol) || u.username || u.password) return null;
    if (u.port && !['80', '443'].includes(u.port)) return null;
    if (!u.hostname.includes('.') || /^(localhost|.*\.local|.*\.internal)$/i.test(u.hostname)) return null;
    return new URL(`${u.protocol}//${u.hostname}/`);
  } catch { return null; }
}

export function isPrivateIp(ip: string): boolean {
  if (ip.includes(':')) {
    const v = ip.toLowerCase();
    if (v.startsWith('::ffff:')) return isPrivateIp(v.slice(7));
    return v === '::1' || v === '::' || /^f[cd]/.test(v) || /^fe[89ab]/.test(v);
  }
  const [a, b] = ip.split('.').map(Number);
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224;
}
