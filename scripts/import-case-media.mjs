// Copies case images, testimonial portraits and videos from the old Framer CMS into the repo.
// Run by .github/workflows/import-case-media.yml. Output: public/cases/<slug>/ and src/data/case-media.json.
import fs from 'node:fs/promises';
import sharp from 'sharp';

const manifest = JSON.parse(await fs.readFile('scripts/case-media.json', 'utf8'));
const MAX_VIDEO_BYTES = 25 * 1024 * 1024;
const out = {};
let ok = 0, failed = 0;

async function get(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'WaviMediaImport/1.0' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res;
}

for (const [slug, m] of Object.entries(manifest)) {
  const dir = `public/cases/${slug}`;
  await fs.mkdir(dir, { recursive: true });
  const entry = { images: [] };

  for (const img of m.images ?? []) {
    try {
      const buf = Buffer.from(await (await get(img.url)).arrayBuffer());
      const n = entry.images.length + 1;
      const info = await sharp(buf).rotate()
        .resize({ width: 1800, height: 1800, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 }).toFile(`${dir}/${n}.webp`);
      entry.images.push({ src: `/cases/${slug}/${n}.webp`, w: info.width, h: info.height, alt: img.alt });
      ok++;
    } catch (e) { failed++; console.error(`image failed  ${slug}  ${img.url}  ${e.message}`); }
  }

  if (m.portrait) {
    try {
      const buf = Buffer.from(await (await get(m.portrait.url)).arrayBuffer());
      await sharp(buf).rotate().resize(240, 240, { fit: 'cover', position: 'attention' }).webp({ quality: 82 }).toFile(`${dir}/portrait.webp`);
      entry.portrait = { src: `/cases/${slug}/portrait.webp`, alt: m.portrait.alt };
      ok++;
    } catch (e) { failed++; console.error(`portrait failed  ${slug}  ${e.message}`); }
  }

  if (m.video) {
    try {
      const res = await get(m.video);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length > MAX_VIDEO_BYTES) console.warn(`video skipped (too large: ${(buf.length / 1e6).toFixed(1)} MB)  ${slug}`);
      else { await fs.writeFile(`${dir}/video.mp4`, buf); entry.video = { src: `/cases/${slug}/video.mp4` }; ok++; }
    } catch (e) { failed++; console.error(`video failed  ${slug}  ${e.message}`); }
  }

  out[slug] = entry;
  console.log(`${slug}: ${entry.images.length} images${entry.portrait ? ', portrait' : ''}${entry.video ? ', video' : ''}`);
}

await fs.writeFile('src/data/case-media.json', JSON.stringify(out, null, 1) + '\n');
console.log(`Done: ${ok} files saved, ${failed} failed.`);
