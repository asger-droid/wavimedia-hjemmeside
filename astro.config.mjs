import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// Every page is static. Only routes with `export const prerender = false` (contact form, store scan) run as Vercel Functions.
export default defineConfig({
  site: 'https://wavimedia.com',
  trailingSlash: 'never',
  build: { format: 'file' },
  adapter: vercel({ maxDuration: 60 })
});
