/*
  Store scan analysis. Pure functions: given the store's HTML (plus any Google Tag Manager container code),
  report only what can actually be seen from outside. Nothing is estimated or invented.
*/

export type Status = 'ok' | 'warn' | 'bad' | 'info';
export interface Check { id: string; name: string; status: Status; note: string; label?: string }

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

// Tag Manager stores tag code as escaped JS strings (fbq(\"init\",\"123\")). Unescape before matching.
const unescapeGtm = (code: string) => code.replace(/\\u003C/gi, '<').replace(/\\u003E/gi, '>').replace(/\\u0026/gi, '&').replace(/\\(["'\/])/g, '$1');

const SERVER_SIDE: [string, RegExp][] = [
  ['Stape', /stape\.(io|net)|stape-|\bstape\b/i],
  ['Elevar', /elevar/i],
  ['Littledata', /littledata/i],
  ['TAGGRS', /taggrs/i],
  ['Addingwell', /addingwell/i]
];

export function analyze(html: string, gtmRaw = ''): Check[] {
  const gtmCode = unescapeGtm(gtmRaw);
  const hay = html + '\n' + gtmCode;
  const where = (re: RegExp) => (re.test(html) ? (re.test(gtmCode) ? 'on the page and in Tag Manager' : 'on the page') : 'in Tag Manager');
  const checks: Check[] = [];

  // Meta Pixel
  const fbIds = uniq([
    ...all(/fbq\(\s*['"]init['"]\s*,\s*['"](\d{8,20})/g, hay),
    ...all(/"vtp_pixelIds?"\s*:\s*"([\d,\s]{8,})"/g, gtmCode).flatMap((v) => v.split(',').map((x) => x.trim())).filter((x) => /^\d{8,20}$/.test(x))
  ]);
  const fbScript = /connect\.facebook\.net\/[^"'\s]*fbevents\.js|fbq\(/;
  const shopifyPixels = (html.split('webPixelsConfigList')[1] ?? '').slice(0, 30000);
  const fbViaShopify = /facebook/i.test(shopifyPixels);
  if (fbIds.length || fbScript.test(hay)) {
    const loc = fbScript.test(hay) ? where(fbScript) : 'in Tag Manager';
    const src = ` (${loc === 'in Tag Manager' ? 'loaded through Tag Manager' : loc})`;
    if (fbIds.length > 1) checks.push({ id: 'meta-pixel', name: 'Meta Pixel', status: 'warn', note: `${fbIds.length} pixels found: ${fbIds.join(', ')}${src}. Check that purchases aren\u2019t counted twice.` });
    else checks.push({ id: 'meta-pixel', name: 'Meta Pixel', status: 'ok', note: fbIds.length ? `Pixel ${fbIds[0]} found${src}.` : `Meta Pixel script found${src}.` });
  } else if (fbViaShopify) {
    checks.push({ id: 'meta-pixel', name: 'Meta Pixel', status: 'ok', note: 'Connected through Shopify\u2019s Facebook & Instagram app.' });
  } else {
    checks.push({ id: 'meta-pixel', name: 'Meta Pixel', status: 'bad', note: 'No Meta Pixel found on the homepage or in Tag Manager.' });
  }

  // Meta Conversions API: server to server, so it cannot be observed directly. Report only visible signs of a server-side setup.
  const vendors = SERVER_SIDE.filter(([, re]) => re.test(hay)).map(([n]) => n);
  const sgtm = all(/(?:server_container_url|transport_url)["'\s,:\[\]a-z]{0,40}(https?:\/\/[a-z0-9.-]+)/gi, hay).filter((u) => !/google|doubleclick/i.test(u));
  // Tag Manager served from the store's own domain instead of googletagmanager.com is a server-side container.
  const ownLoader = all(/src=["']https?:\/\/([a-z0-9.-]+)\/[^"']*gtm\.js\?id=GTM-/gi, html).filter((h) => !/googletagmanager\.com$/i.test(h));
  const sgtmHosts = uniq([...sgtm.map((u) => u.replace(/^https?:\/\//, '')), ...ownLoader]);
  const signs = [...vendors, ...sgtmHosts.map((h) => `server-side Tag Manager (${h})`)];
  if (signs.length) checks.push({ id: 'meta-capi', name: 'Meta Conversions API', status: 'info', label: 'Signs found', note: `Signs of server-side tracking: ${signs.join(', ')}. Whether Meta events actually go through it is confirmed in the senior audit.` });
  else if (fbViaShopify) checks.push({ id: 'meta-capi', name: 'Meta Conversions API', status: 'info', note: 'Shopify\u2019s Meta app can send server events, depending on its data-sharing setting. That can\u2019t be seen from outside. We verify it in the senior audit.' });
  else checks.push({ id: 'meta-capi', name: 'Meta Conversions API', status: 'info', note: 'Server-side events can\u2019t be seen from outside the store. We verify them in the senior audit.' });

  // Google tags
  const ga4 = all(/\b(G-[A-Z0-9]{8,12})\b/g, hay), ads = all(/\b(AW-\d{6,12})\b/g, hay), gtm = gtmIds(html);
  if (ga4.length || ads.length || gtm.length) {
    const parts = [ga4.length && `GA4 ${ga4.join(', ')}`, ads.length && `Google Ads ${ads.join(', ')}`, gtm.length && `Tag Manager ${gtm.join(', ')}`].filter(Boolean);
    const notes: string[] = [];
    if (ga4.length > 1) notes.push(`${ga4.length} GA4 properties load on the same store. Check that purchases aren\u2019t counted twice.`);
    if (ads.length > 1) notes.push(`${ads.length} Google Ads accounts receive data. Check that only the active one counts conversions.`);
    if (!ads.length && ga4.length) notes.push('No Google Ads conversion tag (AW-) in the page or Tag Manager.');
    const status: Status = ga4.length > 1 || ads.length > 1 || (!ads.length && ga4.length) ? 'warn' : 'ok';
    checks.push({ id: 'google', name: 'Google tag', status, note: `Found: ${parts.join(' \u00b7 ')}.${notes.length ? ' ' + notes.join(' ') : ''}` });
  } else {
    checks.push({ id: 'google', name: 'Google tag', status: 'bad', note: 'No Google Analytics, Google Ads or Tag Manager found.' });
  }

  // Consent
  const cmpFound = CMPS.filter(([, re]) => re.test(hay));
  const cmpText = cmpFound.map(([n, re]) => `${n} (${where(re)})`).join(', ');
  const cmRe = /gtag\(\s*['"]consent['"]\s*,\s*['"]default['"]|setDefaultConsentState|["']consent["']\s*,\s*["']default["']|ads_data_redaction/;
  const consentMode = cmRe.test(hay);
  const cmWhere = consentMode ? ` Consent Mode signals ${where(cmRe)}.` : '';
  const shopifyPrivacy = /customerPrivacy|consent-tracking-api|privacy-banner/.test(html);
  const name = 'Consent banner & Consent Mode';
  if (cmpFound.length > 1) checks.push({ id: 'consent', name, status: 'warn', note: `${cmpFound.length} consent tools found: ${cmpText}. Usually only one should run, or visitors can get two banners and conflicting consent.${cmWhere}` });
  else if (cmpFound.length && consentMode) checks.push({ id: 'consent', name, status: 'ok', note: `${cmpText}.${cmWhere}` });
  else if (cmpFound.length) checks.push({ id: 'consent', name, status: 'warn', note: `${cmpText} found, but no Google Consent Mode signals in the page or Tag Manager.` });
  else if (consentMode) checks.push({ id: 'consent', name, status: 'warn', note: `No known consent banner${shopifyPrivacy ? ' (Shopify\u2019s own privacy banner may be in use)' : ''}.${cmWhere}` });
  else checks.push({ id: 'consent', name, status: 'warn', note: shopifyPrivacy ? 'Only Shopify\u2019s customer privacy API found. No Google Consent Mode signals.' : 'No consent banner or Consent Mode signals found on the homepage.' });

  // Klaviyo
  const kl = all(/klaviyo\.js\?company_id=([A-Za-z0-9]{6})/g, hay);
  if (kl.length || /static\.klaviyo\.com|klaviyo\.js|_learnq/.test(hay)) checks.push({ id: 'klaviyo', name: 'Klaviyo onsite tracking', status: 'ok', note: kl.length ? `Klaviyo onsite script found (account ${kl.join(', ')}).` : 'Klaviyo onsite script found.' });
  else checks.push({ id: 'klaviyo', name: 'Klaviyo onsite tracking', status: 'info', note: 'Not detected. Fine if you don\u2019t use Klaviyo.' });

  // TikTok
  const tt = all(/ttq\.load\(\s*['"]([A-Z0-9]{10,})['"]/g, hay);
  if (tt.length || /analytics\.tiktok\.com/.test(hay)) checks.push({ id: 'tiktok', name: 'TikTok Pixel', status: 'ok', note: tt.length ? `Pixel ${tt.join(', ')} found.` : 'TikTok Pixel script found.' });
  else checks.push({ id: 'tiktok', name: 'TikTok Pixel', status: 'info', note: 'Not detected. Fine if you don\u2019t advertise on TikTok.' });

  return checks;
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
