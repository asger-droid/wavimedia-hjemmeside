import type { APIRoute } from 'astro';
import { cases } from '../data/cases';
import { tracks, services } from '../data/services';

// Every public page, built from the same data as the pages themselves, so new cases and services are listed automatically.
const pages = [
  '/', '/work', '/framework', '/studio', '/contact', '/tech-stack', '/wavi-charity', '/privacy',
  '/tools/profit-check', '/tools/store-scan', '/tools/growth-score',
  ...tracks.map((t) => `/services/${t.id}`),
  ...services.map((s) => `/services/${s.slug}`),
  ...cases.map((c) => `/work/${c.slug}`)
];

export const GET: APIRoute = ({ site }) => {
  const urls = pages.map((p) => `  <url><loc>${new URL(p, site).href}</loc></url>`).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' }
  });
};
