import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// Old Framer URLs, so links and search rankings carry over when wavimedia.com moves here.
const oldCases = {
  'casestudy-buildabear': 'build-a-bear', 'casestudy-lulucopenhagen': 'lulu-copenhagen', 'casestudy-blox-fruits': 'blox-fruits',
  'casestudy-mp-denmark': 'mp-denmark', 'casestudy-drømmeland': 'drommeland', 'casestudy-dr%C3%B8mmeland': 'drommeland',
  'casestudy-drink-mashup': 'drink-mashup', 'casestudy-dbu': 'dbu', 'casestudy-sos-international': 'sos-international',
  'casestudy-hjernesagen': 'hjernesagen', 'casestudy-stryhns': 'stryhns', 'casestudy-plusled': 'plusled', 'casestudy-gobabygo': 'gobabygo'
};
const redirects = {
  '/cases': '/work',
  '/about': '/studio',
  '/team': '/studio',
  '/services': '/services/acquisition',
  '/audit': '/contact',
  '/profit-check': '/tools/profit-check',
  '/growth-score': '/tools/growth-score',
  '/store-scan': '/tools/store-scan',
  ...Object.fromEntries(Object.entries(oldCases).map(([from, to]) => [`/cases/${from}`, `/work/${to}`]))
};

// Every page is static. Only routes with `export const prerender = false` (contact form, store scan) run as Vercel Functions.
export default defineConfig({
  site: 'https://wavimedia.com',
  trailingSlash: 'never',
  build: { format: 'file' },
  redirects,
  adapter: vercel({ maxDuration: 60 })
});
