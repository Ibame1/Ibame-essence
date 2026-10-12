// Generates responsive AVIF/WebP variants + the white wordmark into /img.
// Originals in the repo root are never modified. Run: bash tools/build.sh
// New photo: add a row to PHOTOS, then rebuild. A row may carry { extract } to crop (in source pixels) before resizing.
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'img');
await mkdir(out, { recursive: true });

// [source file in repo root, output base name, widths, optional { extract: { left, top, width, height } }]
// valet-tray-1.jpg and coaster-set-1.jpg are AI-generated concept images (see README), not photographs.
const PHOTOS = [
  ['20240407_204836.jpg', 'africa-clock', [360, 720, 1080]],
  ['20240327_111118.jpg', 'name-plaque-1', [360, 720]],
  ['20240327_111145.jpg', 'name-plaque-2', [360, 720]],
  ['20240327_111327.jpg', 'love-coasters', [360, 720]],
  ['20240327_112403.jpg', 'his-tray', [360, 720]],
  ['20240327_112652.jpg', 'slot-trays', [360, 720]],
  ['coaster-honeycomb.jpg', 'coaster-honeycomb', [720, 1080, 1440]],
  // New arrivals. Valet card shows the whole 1745x901 image; the bundle tile uses a square crop of its right-hand side.
  ['valet-tray-1.jpg', 'valet-tray', [480, 960, 1440]],
  ['valet-tray-1.jpg', 'valet-tray-sq', [192, 360], { extract: { left: 800, top: 0, width: 901, height: 901 } }],
  // 1536x1024 source, square crop centred on the stack + holder (used by the card and the bundle tile).
  ['coaster-set-1.jpg', 'coaster-set', [192, 360, 720, 1024], { extract: { left: 275, top: 0, width: 1024, height: 1024 } }],
];

for (const [file, name, widths, opts = {}] of PHOTOS) {
  const src = path.join(root, file);
  const meta = await sharp(src).metadata();
  const crop = opts.extract;
  const maxW = crop ? crop.width : meta.width;
  if (crop && (crop.left + crop.width > meta.width || crop.top + crop.height > meta.height)) {
    throw new Error(`${file}: crop ${JSON.stringify(crop)} is outside the source (${meta.width}x${meta.height})`);
  }
  for (const w of widths) {
    if (w > maxW) throw new Error(`${file}: ${w}px is wider than the source (${maxW}px)`);
    let base = sharp(src).rotate();
    if (crop) base = base.extract(crop);
    base = base.resize({ width: w });
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
