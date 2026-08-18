/**
 * Builds a single verification sheet out of every derived asset so the crops
 * and mattes can be eyeballed in one look. Checkerboard backing makes alpha
 * obvious. Output lands in the scratchpad, not in public/.
 */
import { readdir, mkdir } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import sharp from 'sharp';

const OUT = 'E:/projects/Calidosite/public';
const DEST = process.argv[2] ?? 'E:/projects/Calidosite/.sheet';

const CELL = 260;
const PAD = 14;
const LABEL = 22;
const COLS = 6;

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (/\.(webp|png)$/.test(e.name)) out.push(p);
  }
  return out;
}

function checker(w, h) {
  const s = 12;
  const buf = Buffer.alloc(w * h * 3);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const on = (((x / s) | 0) + ((y / s) | 0)) % 2 === 0;
      const v = on ? 214 : 236;
      const i = (y * w + x) * 3;
      buf[i] = v; buf[i + 1] = v; buf[i + 2] = v;
    }
  }
  return sharp(buf, { raw: { width: w, height: h, channels: 3 } });
}

const files = (await walk(OUT)).sort();

const rows = Math.ceil(files.length / COLS);
const W = COLS * (CELL + PAD) + PAD;
const H = rows * (CELL + PAD + LABEL) + PAD;

const composites = [];
for (const [i, file] of files.entries()) {
  const col = i % COLS;
  const row = (i / COLS) | 0;
  const x = PAD + col * (CELL + PAD);
  const y = PAD + row * (CELL + PAD + LABEL);

  const thumb = await sharp(file)
    .resize({ width: CELL, height: CELL, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const backed = await checker(CELL, CELL)
    .composite([{ input: thumb }])
    .png()
    .toBuffer();

  composites.push({ input: backed, left: x, top: y });

  const name = relative(OUT, file).split(sep).join('/').replace(/\.(webp|png)$/, '');
  const svg = `<svg width="${CELL}" height="${LABEL}" xmlns="http://www.w3.org/2000/svg">
    <text x="0" y="15" font-family="Consolas,monospace" font-size="12" fill="#12151F">${name}</text>
  </svg>`;
  composites.push({ input: Buffer.from(svg), left: x, top: y + CELL + 2 });
}

await mkdir(DEST, { recursive: true });
await sharp({ create: { width: W, height: H, channels: 3, background: '#FFFFFF' } })
  .composite(composites)
  .png()
  .toFile(join(DEST, 'sheet.png'));

console.log(`${files.length} assets -> ${join(DEST, 'sheet.png')} (${W}x${H})`);
