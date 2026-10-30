import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// Every page is static. Only routes with `export const prerender = false` (the contact API) run as a Vercel Function.
export default defineConfig({
  site: 'https://wavimedia.com',
  trailingSlash: 'never',
  build: { format: 'file' },
  adapter: vercel()
});
