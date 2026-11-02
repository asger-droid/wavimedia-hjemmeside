// Copies case images, testimonial portraits and videos from the old Framer CMS into the repo,
// and makes smaller copies (800 and 1200 px wide) so phones and small cards download less.
// Run by .github/workflows/import-case-media.yml. Output: public/cases/<slug>/ and src/data/case-media.json.
// Files already in public/cases/ are reused, so a re-run only fetches what is missing.
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import sharp from 'sharp';

const manifest = JSON.parse(await fs.readFile('scripts/case-media.json', 'utf8'));
const MAX_VIDEO_BYTES = 25 * 1024 * 1024;
const WIDTHS = [800, 1200];
const out = {};
let fetched = 0, reused = 0, variants = 0, failed = 0;

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
    const n = entry.images.length + 1;
    const file = `${dir}/${n}.webp`;
    try {
      if (existsSync(file)) reused++;
      else {
        const buf = Buffer.from(await (await get(img.url)).arrayBuffer());
        await sharp(buf).rotate().resize({ width: 1800, height: 1800, fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toFile(file);
        fetched++;
      }
      const meta = await sharp(file).metadata();
      const item = { src: `/cases/${slug}/${n}.webp`, w: meta.width, h: meta.height, alt: img.alt };
      const sizes = [];
      for (const w of WIDTHS) {
        if (meta.width <= w * 1.15) continue; // not worth a copy when the original is about this size already
        const vfile = `${dir}/${n}-${w}.webp`;
        if (!existsSync(vfile)) { await sharp(file).resize({ width: w }).webp({ quality: 76 }).toFile(vfile); variants++; }
        sizes.push({ w, src: `/cases/${slug}/${n}-${w}.webp` });
      }
      if (sizes.length) item.variants = sizes;
      entry.images.push(item);
    } catch (e) { failed++; console.error(`image failed  ${slug}  ${img.url}  ${e.message}`); }
  }

  if (m.portrait) {
    const file = `${dir}/portrait.webp`;
    try {
      if (existsSync(file)) reused++;
      else {
        const buf = Buffer.from(await (await get(m.portrait.url)).arrayBuffer());
        await sharp(buf).rotate().resize(240, 240, { fit: 'cover', position: 'attention' }).webp({ quality: 82 }).toFile(file);
        fetched++;
      }
      entry.portrait = { src: `/cases/${slug}/portrait.webp`, alt: m.portrait.alt };
    } catch (e) { failed++; console.error(`portrait failed  ${slug}  ${e.message}`); }
  }

  if (m.video) {
    const file = `${dir}/video.mp4`;
    try {
      if (existsSync(file)) { reused++; entry.video = { src: `/cases/${slug}/video.mp4` }; }
      else {
        const buf = Buffer.from(await (await get(m.video)).arrayBuffer());
        if (buf.length > MAX_VIDEO_BYTES) console.warn(`video skipped (too large: ${(buf.length / 1e6).toFixed(1)} MB)  ${slug}`);
        else { await fs.writeFile(file, buf); entry.video = { src: `/cases/${slug}/video.mp4` }; fetched++; }
      }
    } catch (e) { failed++; console.error(`video failed  ${slug}  ${e.message}`); }
  }

  out[slug] = entry;
  console.log(`${slug}: ${entry.images.length} images${entry.portrait ? ', portrait' : ''}${entry.video ? ', video' : ''}`);
}

await fs.writeFile('src/data/case-media.json', JSON.stringify(out, null, 1) + '\n');
console.log(`Done: ${fetched} fetched, ${reused} reused, ${variants} smaller copies made, ${failed} failed.`);
