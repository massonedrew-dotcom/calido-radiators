/**
 * Derives web-ready imagery from the Calido story exports.
 *
 * Every source is a 1080x1920 story with headline copy, the logo and the "NN/10"
 * counter baked into the pixels. So the pipeline is:
 *   1. crop to a region that contains the product and no typography
 *   2. optionally matte the light studio background out to alpha
 *   3. auto-trim to the remaining ink
 *   4. emit avif + webp (and png when alpha is required for masking/clip-path)
 *
 * Run: npm run prep:assets
 */
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const SRC = 'C:/Users/user/Desktop/calodi';
const ROOT = 'E:/projects/Calidosite';
const OUT = join(ROOT, 'public');
const MANIFEST = join(ROOT, 'content', 'assets.generated.ts');

/**
 * Background matte thresholds, in luminance units (0-255).
 * Pixels above CLEAR are candidate background, below SOLID are certainly product.
 */
const CLEAR = 246;
const SOLID = 232;

/** Identical framing across the five spec sheets, so the colour switcher swaps like-for-like. */
const SWATCH_CROP = [730, 80, 350, 790];

/** @type {{id:string,src:string,crop:[number,number,number,number],alpha?:boolean,png?:boolean,widths?:number[],knockout?:string}[]} */
const JOBS = [
  // ---- 01 hero -----------------------------------------------------------
  // Graphite BRAVO body: the highest-contrast silhouette in the set, so it
  // mattes cleanly and reads as metal solidifying out of the melt.
  { id: 'hero/silhouette', src: '1 (64).png', crop: [0, 530, 1080, 1200], alpha: true, png: true },
  { id: 'hero/white', src: '1 (67).png', crop: [120, 720, 960, 1200] },

  // ---- 02..08 sections ---------------------------------------------------
  { id: 'sections/about-steel', src: '2 (59).png', crop: [0, 730, 1080, 1190] },
  { id: 'sections/capacity-green', src: '3 (33).png', crop: [300, 780, 780, 1140], alpha: true, png: true },
  { id: 'sections/tech-indigo', src: '4 (12).png', crop: [0, 725, 1080, 1195], alpha: true, png: true },
  { id: 'sections/qc-white', src: '5 (10).png', crop: [470, 465, 570, 1455] },
  { id: 'sections/heat-silver', src: '6 (9).png', crop: [0, 735, 1080, 1185], alpha: true, png: true },
  { id: 'sections/benefits-indigo', src: '7 (10).png', crop: [0, 800, 1080, 1120], alpha: true, png: true },
  { id: 'sections/interior', src: '8 (3).png', crop: [0, 755, 1080, 1165] },
  { id: 'sections/warranty-mustard', src: '9 (4).png', crop: [480, 985, 600, 935], alpha: true, png: true },
  { id: 'sections/final-white', src: '10 (2).png', crop: [0, 775, 1060, 1145] },

  // ---- 09 model range ----------------------------------------------------
  { id: 'models/infinity', src: '1 (61).png', crop: [0, 520, 1080, 1200], alpha: true, png: true },
  { id: 'models/elegant', src: '1 (62).png', crop: [0, 540, 1080, 1180], alpha: true, png: true },
  // ELEGANT PREMIUM arrived after the original batch, on its own pair of story
  // slides. Same 1080x1920 layout as its siblings, so the same crop window
  // applies — verify against the render once the source lands.
  {
    id: 'models/elegant-premium',
    src: 'elegant-premium.png',
    crop: [0, 540, 1080, 1180],
    alpha: true,
    png: true,
  },
  { id: 'models/classic', src: '1 (63).png', crop: [0, 490, 1080, 1230], alpha: true, png: true },
  { id: 'models/bravo', src: '1 (64).png', crop: [0, 530, 1080, 1200], alpha: true, png: true },
  { id: 'models/classic-350', src: '1 (65).png', crop: [0, 460, 1080, 1250], alpha: true, png: true },
  { id: 'models/lineup', src: '1 (66).png', crop: [0, 815, 1080, 480] },

  // ---- 10 colours --------------------------------------------------------
  // The five spec sheets carry the same isolated section render in five real
  // factory colours, framed identically. That is the honest source for a
  // colour switcher; mustard comes from the warranty slide.
  { id: 'colors/white', src: '2 (53).png', crop: SWATCH_CROP, alpha: true, png: true, widths: [480, 900] },
  { id: 'colors/indigo', src: '2 (54).png', crop: SWATCH_CROP, alpha: true, png: true, widths: [480, 900] },
  { id: 'colors/green', src: '2 (55).png', crop: SWATCH_CROP, alpha: true, png: true, widths: [480, 900] },
  { id: 'colors/graphite', src: '2 (56).png', crop: SWATCH_CROP, alpha: true, png: true, widths: [480, 900] },
  { id: 'colors/terracotta', src: '2 (57).png', crop: SWATCH_CROP, alpha: true, png: true, widths: [480, 900] },
  { id: 'colors/stack', src: '2 (58).png', crop: [0, 600, 1080, 1120] },

  // ---- brand -------------------------------------------------------------
  // Flat matte, not flood fill: the counters inside "a", "d" and "o" are
  // enclosed white regions the border fill can never reach, and filling them
  // would weld the letterforms shut on the knockout variant.
  { id: 'brand/logo', src: 'IMG_6205.PNG', crop: [110, 420, 1060, 350], alpha: true, flat: true, png: true, widths: [320, 640] },
  {
    id: 'brand/logo-white',
    src: 'IMG_6205.PNG',
    crop: [110, 420, 1060, 350],
    alpha: true,
    flat: true,
    png: true,
    widths: [320, 640],
    knockout: '#FFFFFF',
  },
];

/**
 * Straight luminance ramp against a paper-white background. Used for flat
 * artwork (the logo), where enclosed light regions are genuinely holes.
 */
function flatMatte(data, w, h) {
  const CLEAR_FLAT = 252;
  const RAMP = 70;
  for (let i = 0; i < w * h; i++) {
    const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
    const lum = (r * 77 + g * 150 + b * 29) >> 8;
    data[i * 4 + 3] = Math.max(0, Math.min(255, Math.round(((CLEAR_FLAT - lum) / RAMP) * 255)));
  }
  return data;
}

/**
 * Builds an alpha channel by flood-filling the light studio background inward
 * from the frame edge. Filling from the border (rather than thresholding every
 * pixel) keeps specular highlights *inside* the product opaque.
 */
function matte(data, w, h) {
  const n = w * h;
  const lum = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
    lum[i] = (r * 77 + g * 150 + b * 29) >> 8;
  }

  // 1. Flood fill background: light pixels reachable from any frame edge.
  const outside = new Uint8Array(n);
  const stack = new Int32Array(n);
  let sp = 0;
  const push = (i) => {
    if (!outside[i] && lum[i] >= CLEAR) { outside[i] = 1; stack[sp++] = i; }
  };
  for (let x = 0; x < w; x++) { push(x); push((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { push(y * w); push(y * w + w - 1); }
  while (sp > 0) {
    const i = stack[--sp];
    const x = i % w, y = (i / w) | 0;
    if (x > 0) push(i - 1);
    if (x < w - 1) push(i + 1);
    if (y > 0) push(i - w);
    if (y < h - 1) push(i + w);
  }

  // 2. Anything not reached is product (interior holes included).
  const solid = new Uint8Array(n);
  for (let i = 0; i < n; i++) solid[i] = outside[i] ? 0 : 1;

  // 3. Soft edge: only pixels within 2px of the matte boundary get a ramped
  //    alpha, so antialiasing survives without eating into the body.
  const R = 2;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (!solid[i]) { data[i * 4 + 3] = 0; continue; }
      let boundary = false;
      for (let dy = -R; dy <= R && !boundary; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= h) { boundary = true; break; }
        for (let dx = -R; dx <= R; dx++) {
          const xx = x + dx;
          if (xx < 0 || xx >= w) { boundary = true; break; }
          if (!solid[yy * w + xx]) { boundary = true; break; }
        }
      }
      if (!boundary) { data[i * 4 + 3] = 255; continue; }
      const t = (CLEAR - lum[i]) / (CLEAR - SOLID);
      data[i * 4 + 3] = Math.max(0, Math.min(255, Math.round(t * 255)));
    }
  }
  return data;
}

/** Crops to the bounding box of every pixel with alpha above `min`. */
async function trimAlpha(pipeline, min = 8) {
  const { data, info } = await pipeline.raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: c } = info;
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * c + 3] > min) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  if (x1 < 0) return { data, info, box: { left: 0, top: 0, width: w, height: h } };
  return {
    data,
    info,
    box: { left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 },
  };
}

async function run() {
  const available = new Set(await readdir(SRC));
  const report = [];
  /** @type {{id:string,src:string,width:number,height:number}[]} */
  const manifest = [];

  for (const job of JOBS) {
    if (!available.has(job.src)) {
      report.push({ id: job.id, status: `MISSING SOURCE ${job.src}` });
      continue;
    }
    const [left, top, width, height] = job.crop;
    let img = sharp(join(SRC, job.src)).extract({ left, top, width, height });

    let finalW = width;
    let finalH = height;

    if (job.alpha) {
      const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      (job.flat ? flatMatte : matte)(data, info.width, info.height);
      if (job.knockout) {
        // Flatten every retained pixel to one colour, keeping the matte's
        // antialiasing — used for the logo on the indigo-900 footer.
        const r = parseInt(job.knockout.slice(1, 3), 16);
        const g = parseInt(job.knockout.slice(3, 5), 16);
        const b = parseInt(job.knockout.slice(5, 7), 16);
        for (let i = 0; i < info.width * info.height; i++) {
          data[i * 4] = r; data[i * 4 + 1] = g; data[i * 4 + 2] = b;
        }
      }
      const matted = sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } });
      const { data: raw, info: rawInfo, box } = await trimAlpha(matted.clone());
      img = sharp(raw, { raw: { width: rawInfo.width, height: rawInfo.height, channels: rawInfo.channels } })
        .extract(box);
      finalW = box.width;
      finalH = box.height;
    }

    await mkdir(dirname(join(OUT, job.id)), { recursive: true });

    // One master per asset. next/image derives the responsive avif/webp ladder
    // at request time, so emitting our own width variants here would only
    // duplicate that work.
    //
    // WebP for the cutouts too: it carries alpha just as well as PNG at a
    // fraction of the size, and nothing on the page consumes these as CSS masks
    // — the transparency exists so the product sits on the page background and
    // so the WebGL stage can hand over to a still.
    const out = join(OUT, `${job.id}.webp`);
    await img
      .clone()
      .webp(job.alpha ? { quality: 92, alphaQuality: 100, effort: 6 } : { quality: 86, effort: 6 })
      .toFile(out);

    manifest.push({ id: job.id, src: `/${job.id}.webp`, width: finalW, height: finalH });
    report.push({ id: job.id, size: `${finalW}x${finalH}`, alpha: job.alpha ? 'yes' : '' });
  }

  manifest.sort((a, b) => a.id.localeCompare(b.id));
  const body = manifest
    .map((m) => `  '${m.id}': { src: '${m.src}', width: ${m.width}, height: ${m.height} },`)
    .join('\n');

  await writeFile(
    MANIFEST,
    `// GENERATED by scripts/prep-assets.mjs — do not edit by hand.\n` +
      `export interface DerivedAsset {\n  readonly src: string;\n  readonly width: number;\n  readonly height: number;\n}\n\n` +
      `export const ASSETS = {\n${body}\n} as const satisfies Record<string, DerivedAsset>;\n\n` +
      `export type AssetId = keyof typeof ASSETS;\n\n` +
      `export function asset(id: AssetId): DerivedAsset {\n  return ASSETS[id];\n}\n`,
    'utf8',
  );

  console.table(report);
  console.log(`manifest -> ${MANIFEST}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
