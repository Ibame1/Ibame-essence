// Generates responsive AVIF/WebP variants + the white wordmark into /img.
// Originals in the repo root are never modified. Run: bash tools/build.sh
// When valet-tray-1.jpg / coaster-set-1.jpg (or any new photo) are added: add a row to PHOTOS, then rebuild.
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'img');
await mkdir(out, { recursive: true });

// [source file in repo root, output base name, widths]
const PHOTOS = [
  ['20240407_204836.jpg', 'africa-clock', [360, 720, 1080]],
  ['20240327_111118.jpg', 'name-plaque-1', [360, 720]],
  ['20240327_111145.jpg', 'name-plaque-2', [360, 720]],
  ['20240327_111327.jpg', 'love-coasters', [360, 720]],
  ['20240327_112403.jpg', 'his-tray', [360, 720]],
  ['20240327_112652.jpg', 'slot-trays', [360, 720]],
  ['coaster-honeycomb.jpg', 'coaster-honeycomb', [720, 1080, 1440]],
];

for (const [file, name, widths] of PHOTOS) {
  const src = path.join(root, file);
  const meta = await sharp(src).metadata();
  for (const w of widths) {
    if (w > meta.width) throw new Error(`${file}: ${w}px is wider than the source (${meta.width}px)`);
    const base = sharp(src).rotate().resize({ width: w });
    await base.clone().avif({ quality: 52, effort: 5 }).toFile(path.join(out, `${name}-${w}.avif`));
    await base.clone().webp({ quality: 76, effort: 5 }).toFile(path.join(out, `${name}-${w}.webp`));
  }
  console.log('photo', name, widths.join('/'));
}

// White wordmark on transparent, cropped to the artwork. The master is black-on-transparent in a 2000x2000
// canvas with ~75% empty padding; this replaces the CSS invert()/mix-blend-mode filter and the 171 KB PNG.
{
  const src = path.join(root, 'FinalWhiteBgrd (1).png');
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  let x0 = W, y0 = H, x1 = 0, y1 = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (data[(y * W + x) * 4 + 3] > 8) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  }
  for (let i = 0; i < data.length; i += 4) { data[i] = data[i + 1] = data[i + 2] = 255; }
  const pad = 24;
  const left = Math.max(0, x0 - pad), top = Math.max(0, y0 - pad);
  const width = Math.min(W, x1 + pad + 1) - left, height = Math.min(H, y1 + pad + 1) - top;
  const info2 = await sharp(data, { raw: { width: W, height: H, channels: 4 } })
    .extract({ left, top, width, height }).resize({ width: 420 })
    .webp({ quality: 90, alphaQuality: 100, effort: 6 })
    .toFile(path.join(out, 'ibame-wordmark-white.webp'));
  console.log('wordmark', info2.width + 'x' + info2.height, info2.size + ' bytes');
}
