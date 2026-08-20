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

/** Identical framing across the five spec sheets, so the colour switcher swaps like-for-like. */
const SWATCH_CROP = [730, 80, 350, 790];

/**
 * @type {{
 *   id:string, src:string, crop:[number,number,number,number],
 *   alpha?:boolean, flat?:boolean, png?:boolean, widths?:number[],
 *   knockout?:string, strictMatte?:boolean, tint?:'metal'|'indigo'|'red', tintMix?:number
 * }[]}
 *
 * Two rules run through this table now.
 *
 * `alpha` is no longer optional for anything that lands on the page as a
 * product: the site has exactly one background and it is a live gradient, so an
 * un-matted still would paint its studio white as a rectangle over whatever
 * temperature the scroll happens to be at.
 *
 * `tint` puts every product in the palette. The only renders that keep their
 * own colour are the five colourway swatches, because that section exists to
 * show real factory finishes and recolouring them would delete its content.
 */
const JOBS = [
  // ---- 01 hero -----------------------------------------------------------
  // Graphite BRAVO body: the highest-contrast silhouette in the set, so it
  // mattes cleanly and reads as metal solidifying out of the melt.
  { id: 'hero/silhouette', src: '1 (64).png', crop: [0, 530, 1080, 1200], alpha: true, png: true, tint: 'metal' },
  { id: 'hero/white', src: '1 (67).png', crop: [120, 720, 960, 1200], alpha: true, png: true, tint: 'metal', strictMatte: true },

  // ---- 02..08 sections ---------------------------------------------------
  { id: 'sections/about-steel', src: '2 (59).png', crop: [0, 730, 1080, 1190], alpha: true, png: true, tint: 'metal' },
  { id: 'sections/capacity-green', src: '3 (33).png', crop: [300, 780, 780, 1140], alpha: true, png: true, tint: 'metal' },
  { id: 'sections/tech-indigo', src: '4 (12).png', crop: [0, 725, 1080, 1195], alpha: true, png: true, tint: 'indigo' },
  { id: 'sections/qc-white', src: '5 (10).png', crop: [470, 465, 570, 1455], alpha: true, png: true, tint: 'metal', strictMatte: true },
  { id: 'sections/heat-silver', src: '6 (9).png', crop: [0, 735, 1080, 1185], alpha: true, png: true, tint: 'red', tintMix: 0.9 },
  { id: 'sections/benefits-indigo', src: '7 (10).png', crop: [0, 800, 1080, 1120], alpha: true, png: true, tint: 'indigo' },
  // ---- 09 interior -------------------------------------------------------
  // Recropped off the original full-bleed window. The source frames a white
  // radiator on a white wall with a blown-out curtain filling the left third;
  // the old crop kept all of it, so a third of the picture carried no
  // information and the product had nothing to separate from.
  //
  // Two derivatives now: a room plate that gets pushed back in CSS, and a tight
  // plate of the product itself that is laid back over it in full contrast.
  { id: 'sections/interior', src: '8 (3).png', crop: [430, 900, 650, 560] },
  { id: 'sections/interior-product', src: '8 (3).png', crop: [506, 946, 524, 516] },
  { id: 'sections/warranty-mustard', src: '9 (4).png', crop: [480, 985, 600, 935], alpha: true, png: true, tint: 'red' },
  { id: 'sections/final-white', src: '10 (2).png', crop: [0, 775, 1060, 1145], alpha: true, png: true, tint: 'metal', strictMatte: true },

  // ---- 09 model range ----------------------------------------------------
  // All six on one finish. The range differs by dimension and output, not by
  // paint, and six different colours across six cards read as six products
  // from six factories.
  { id: 'models/infinity', src: '1 (61).png', crop: [0, 520, 1080, 1200], alpha: true, png: true, tint: 'metal' },
  { id: 'models/elegant', src: '1 (62).png', crop: [0, 540, 1080, 1180], alpha: true, png: true, tint: 'metal' },
  // ELEGANT PREMIUM arrived after the original batch, on its own pair of story
  // slides. Same 1080x1920 layout as its siblings, so the same crop window
  // applies — verify against the render once the source lands.
  {
    id: 'models/elegant-premium',
    src: 'elegant-premium.png',
    crop: [0, 540, 1080, 1180],
    alpha: true,
    png: true,
    tint: 'metal',
    strictMatte: true,
  },
  { id: 'models/classic', src: '1 (63).png', crop: [0, 490, 1080, 1230], alpha: true, png: true, tint: 'metal' },
  { id: 'models/bravo', src: '1 (64).png', crop: [0, 530, 1080, 1200], alpha: true, png: true, tint: 'metal' },
  { id: 'models/classic-350', src: '1 (65).png', crop: [0, 460, 1080, 1250], alpha: true, png: true, tint: 'metal' },
  { id: 'models/lineup', src: '1 (66).png', crop: [0, 815, 1080, 480], alpha: true, png: true, tint: 'metal' },

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

/* ---------------------------------------------------------------------------
   Brand recolour.

   The source stories ship the product in green, mustard, terracotta, cobalt and
   five kinds of grey. None of those are in the palette, and a landing page that
   shows a green radiator beside an indigo logo has no colour system at all.

   These renders are matte painted product under a softbox, so their whole value
   structure lives in luminance — which means a luminance-indexed ramp swaps the
   finish without touching the form. Specular highlights land at the top of the
   ramp and stay specular; cavity shadows land at the bottom and stay shadow.
   Nothing posterises, because the ramp is smoothstep-interpolated per pixel.

   The endpoints are the same numbers as styles/tokens.css, so the finishes in
   the imagery and the finishes in the CSS cannot drift apart.
   --------------------------------------------------------------------------- */
const RAMPS = {
  // Anodised aluminium: neutral highlight, indigo-cast body, indigo-900 cavity.
  // This is the unified finish for the whole model range.
  metal: [
    [0.0, [0x12, 0x18, 0x38]],
    [0.34, [0x3f, 0x49, 0x74]],
    [0.62, [0x8d, 0x96, 0xb2]],
    [0.84, [0xd2, 0xd8, 0xea]],
    [1.0, [0xf6, 0xf8, 0xfd]],
  ],
  // Brand indigo paint, #22337E at the mid stop.
  indigo: [
    [0.0, [0x07, 0x0b, 0x24]],
    [0.32, [0x16, 0x20, 0x5c]],
    [0.6, [0x22, 0x33, 0x7e]],
    [0.84, [0x6f, 0x7e, 0xc4]],
    [1.0, [0xe6, 0xea, 0xf9]],
  ],
  // Brand red paint, #D91222 at the mid stop.
  red: [
    [0.0, [0x2a, 0x04, 0x09]],
    [0.32, [0x7c, 0x0b, 0x15]],
    [0.6, [0xd9, 0x12, 0x22]],
    [0.84, [0xf0, 0x8a, 0x84]],
    [1.0, [0xfd, 0xee, 0xee]],
  ],
};

/**
 * Remaps every pixel through a luminance ramp, in place, leaving alpha alone.
 *
 * The source luminance is normalised against the *product's own* range before
 * it indexes the ramp. Without that step the range comes out inconsistent for
 * the reason you would expect: a white ELEGANT PREMIUM occupies luminance
 * 228-255 and a graphite BRAVO occupies 20-250, so a raw index lands the first
 * one entirely in the top eighth of the ramp and the second across all of it —
 * six cards, two different finishes. Stretching each product to the full range
 * first is what makes one ramp produce one finish.
 *
 * A `mix` below 1 keeps a trace of the original chroma, for sources where the
 * hue was carrying shape that the luminance channel alone does not.
 */
function tint(data, w, h, rampName, mix = 1) {
  const ramp = RAMPS[rampName];
  if (!ramp) throw new Error(`unknown ramp: ${rampName}`);

  // Percentile endpoints rather than min/max: a single stray dark pixel from
  // the matte edge would otherwise define the bottom of the range.
  const hist = new Uint32Array(256);
  let opaque = 0;
  for (let i = 0; i < w * h; i++) {
    if (data[i * 4 + 3] < 24) continue;
    const l = (data[i * 4] * 77 + data[i * 4 + 1] * 150 + data[i * 4 + 2] * 29) >> 8;
    hist[l]++;
    opaque++;
  }

  let lo = 0;
  let hi = 255;
  if (opaque > 0) {
    const loTarget = opaque * 0.02;
    const hiTarget = opaque * 0.98;
    let seen = 0;
    for (let l = 0; l < 256; l++) {
      seen += hist[l];
      if (seen >= loTarget) { lo = l; break; }
    }
    seen = 0;
    for (let l = 0; l < 256; l++) {
      seen += hist[l];
      if (seen >= hiTarget) { hi = l; break; }
    }
  }
  const range = Math.max(24, hi - lo);

  // 256-entry lookup, built once per image rather than evaluated per pixel.
  const lut = new Uint8Array(256 * 3);
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    let a = ramp[0];
    let b = ramp[ramp.length - 1];
    for (let k = 0; k < ramp.length - 1; k++) {
      if (t >= ramp[k][0] && t <= ramp[k + 1][0]) {
        a = ramp[k];
        b = ramp[k + 1];
        break;
      }
    }
    const span = b[0] - a[0] || 1;
    const f = Math.min(1, Math.max(0, (t - a[0]) / span));
    // Smoothstep between stops, so the ramp has no visible knee.
    const s = f * f * (3 - 2 * f);
    for (let c = 0; c < 3; c++) lut[i * 3 + c] = Math.round(a[1][c] + (b[1][c] - a[1][c]) * s);
  }

  for (let i = 0; i < w * h; i++) {
    if (data[i * 4 + 3] === 0) continue;
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    const raw = (r * 77 + g * 150 + b * 29) >> 8;
    const lum = Math.max(0, Math.min(255, Math.round(((raw - lo) / range) * 255)));
    for (let c = 0; c < 3; c++) {
      const to = lut[lum * 3 + c];
      data[i * 4 + c] = mix >= 1 ? to : Math.round(data[i * 4 + c] * (1 - mix) + to * mix);
    }
  }
  return data;
}

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
 * Builds an alpha channel by growing the studio background inward from the
 * frame edge.
 *
 * The first version of this thresholded against fixed luminance constants, and
 * that was fine while every cutout landed on a white card: whatever backdrop it
 * failed to remove was white-on-white and invisible. On a live thermal gradient
 * the same residue is a pale rectangle, and the constants turned out to be
 * wrong for half the set — the `2 (59)` backdrop tops out at 249 with corners at
 * 244, i.e. entirely below the old CLEAR of 246, so the fill never even seeded.
 *
 * Two changes fix it for every source at once:
 *
 *   · the thresholds are derived from the image's own border ring rather than
 *     hardcoded, so a backdrop printed at 244 and one printed at 253 both work;
 *
 *   · growth accepts a pixel that is merely *similar to the neighbour it came
 *     from*, not just one above an absolute level. Studio backdrops are smooth
 *     ramps, so similarity walks the whole ramp; a product edge is a cliff, so
 *     it stops there. An absolute floor keeps a runaway walk out of the body.
 */
function matte(data, w, h, strict = false) {
  const n = w * h;
  const lum = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
    lum[i] = (r * 77 + g * 150 + b * 29) >> 8;
  }

  // 0. Backdrop level, read off the border ring. Median rather than mean: on
  //    the crops where the product runs out of frame, part of the ring is
  //    product and would drag an average down with it.
  const ring = [];
  for (let x = 0; x < w; x += 2) { ring.push(lum[x]); ring.push(lum[(h - 1) * w + x]); }
  for (let y = 0; y < h; y += 2) { ring.push(lum[y * w]); ring.push(lum[y * w + w - 1]); }
  ring.sort((a, b) => a - b);
  const bg = ring[(ring.length * 0.75) | 0];

  const CLEAR = Math.max(200, bg - (strict ? 3 : 8)); // certainly backdrop
  const SOLID = Math.max(160, bg - (strict ? 12 : 30)); // certainly product
  const FLOOR = Math.max(150, bg - 46); // growth may never go below this
  // Similarity growth walks smooth backdrop ramps — and would walk straight
  // into a white product on a white wall, because there is no cliff between
  // them. `strict` turns it off and falls back to a pure threshold, which is
  // the right trade for the four white-on-white sources: those keep a little
  // backdrop, but they are only ever placed on the light surface where a pale
  // residue is invisible, and CSS feathers what is left.
  const TOL = strict ? 0 : 6; // per-step similarity, in luminance

  // 1. Grow the background from every frame edge.
  const outside = new Uint8Array(n);
  const stack = new Int32Array(n);
  let sp = 0;

  const seed = (i) => {
    if (!outside[i] && lum[i] >= CLEAR) { outside[i] = 1; stack[sp++] = i; }
  };
  const grow = (i, from) => {
    if (outside[i]) return;
    if (lum[i] < FLOOR) return;
    if (lum[i] < CLEAR && lum[from] - lum[i] > TOL) return;
    outside[i] = 1;
    stack[sp++] = i;
  };

  for (let x = 0; x < w; x++) { seed(x); seed((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { seed(y * w); seed(y * w + w - 1); }
  while (sp > 0) {
    const i = stack[--sp];
    const x = i % w, y = (i / w) | 0;
    if (x > 0) grow(i - 1, i);
    if (x < w - 1) grow(i + 1, i);
    if (y > 0) grow(i - w, i);
    if (y < h - 1) grow(i + w, i);
  }

  // 2. Anything not reached is product — interior holes included.
  const solid = new Uint8Array(n);
  for (let i = 0; i < n; i++) solid[i] = outside[i] ? 0 : 1;

  // 3. Drop retained specks. A backdrop blemish that the growth could not reach
  //    survives step 2 as a tiny island, and on a dark gradient a forty-pixel
  //    white island is exactly as visible as a large one.
  const MIN_AREA = Math.max(64, Math.round(n * 0.0015));
  const label = new Int32Array(n).fill(-1);
  for (let start = 0; start < n; start++) {
    if (!solid[start] || label[start] !== -1) continue;

    sp = 0;
    stack[sp++] = start;
    label[start] = start;
    const members = [];
    while (sp > 0) {
      const i = stack[--sp];
      members.push(i);
      const x = i % w, y = (i / w) | 0;
      const step = (j) => {
        if (j >= 0 && j < n && solid[j] && label[j] === -1) { label[j] = start; stack[sp++] = j; }
      };
      if (x > 0) step(i - 1);
      if (x < w - 1) step(i + 1);
      if (y > 0) step(i - w);
      if (y < h - 1) step(i + w);
    }

    if (members.length < MIN_AREA) for (const i of members) solid[i] = 0;
  }

  // 4. Soft edge: only pixels within 2px of the matte boundary get a ramped
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
      const t = (CLEAR - lum[i]) / Math.max(1, CLEAR - SOLID);
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
      if (job.flat) flatMatte(data, info.width, info.height);
      else matte(data, info.width, info.height, job.strictMatte === true);
      // After the matte, so the studio background never bleeds into the ramp,
      // and before the knockout, which overwrites colour outright.
      if (job.tint) tint(data, info.width, info.height, job.tint, job.tintMix ?? 1);
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

    // One master per asset.
    //
    // There is no image optimiser at runtime: the site is a static export, so
    // `images.unoptimized` is on and whatever is written here is exactly what a
    // phone downloads. That makes both numbers below load-bearing rather than
    // cosmetic.
    //
    // Width is capped at MAX_W. Nothing on the page renders a product wider
    // than about 700 CSS px, so a 1080px master was paying for roughly twice
    // the pixels any device asks for. At 2x DPR on the widest slot, 900 is
    // still oversampled.
    //
    // Quality is 82 rather than 92. These are smooth studio renders on a
    // transparent ground; the audit's mobile pass was LCP-bound at 3.9s with
    // 370 KiB of product imagery ahead of first paint, and 92 was buying
    // nothing visible against that.
    //
    // WebP for the cutouts too: it carries alpha as well as PNG at a fraction
    // of the size, and nothing consumes these as CSS masks — the transparency
    // exists so the product sits on the live background and so the WebGL stage
    // can hand over to a still.
    const MAX_W = 1400;
    if (finalW > MAX_W) {
      const scaled = Math.round((finalH * MAX_W) / finalW);
      img = img.resize({ width: MAX_W, height: scaled, fit: 'fill', kernel: 'lanczos3' });
      finalH = scaled;
      finalW = MAX_W;
    }

    const encode = (pipeline) =>
      pipeline.webp(
        job.alpha ? { quality: 93, alphaQuality: 100, effort: 6 } : { quality: 88, effort: 6 },
      );

    await encode(img.clone()).toFile(join(OUT, `${job.id}.webp`));

    /**
     * Responsive variants.
     *
     * `images.unoptimized` is on because a static export has no optimiser
     * route, and that also switches off Next's srcset generation: every device
     * downloads the master. On a phone the hero renders about 340 CSS px wide
     * and was pulling the full 900px file for it.
     *
     * So the ladder is emitted here instead, and lib/imageLoader.ts picks the
     * rung. Widths are chosen to cover 1x and 2x at the layout's real render
     * sizes rather than to fill out a generic scale.
     */
    const VARIANTS = [480, 720, 1080];
    const widths = [];
    for (const w of VARIANTS) {
      if (w >= finalW) continue;
      const h = Math.round((finalH * w) / finalW);
      await encode(
        img.clone().resize({ width: w, height: h, fit: 'fill', kernel: 'lanczos3' }),
      ).toFile(join(OUT, `${job.id}@${w}.webp`));
      widths.push(w);
    }
    widths.push(finalW);

    manifest.push({ id: job.id, src: `/${job.id}.webp`, width: finalW, height: finalH, widths });
    report.push({ id: job.id, size: `${finalW}x${finalH}`, alpha: job.alpha ? 'yes' : '' });
  }

  manifest.sort((a, b) => a.id.localeCompare(b.id));
  const body = manifest
    .map(
      (m) =>
        `  '${m.id}': { src: '${m.src}', width: ${m.width}, height: ${m.height}, widths: [${m.widths.join(', ')}] },`,
    )
    .join('\n');

  await writeFile(
    MANIFEST,
    `// GENERATED by scripts/prep-assets.mjs — do not edit by hand.\n` +
      `export interface DerivedAsset {\n` +
      `  readonly src: string;\n` +
      `  readonly width: number;\n` +
      `  readonly height: number;\n` +
      `  /** Emitted widths, ascending. The last entry is the master file. */\n` +
      `  readonly widths: readonly number[];\n` +
      `}\n\n` +
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
