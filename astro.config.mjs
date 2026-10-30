import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://wavimedia.com',
  trailingSlash: 'never',
  build: { format: 'file' }
});
