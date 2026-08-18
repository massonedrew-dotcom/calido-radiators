/**
 * Language-neutral product data. Every figure here is transcribed from the
 * factory spec sheets in the source assets — nothing is interpolated.
 *
 * Note the spec rows are NOT uniform across the range: the INFINITY sheet
 * publishes a maximum temperature where the other four publish section volume.
 * The card renders whatever rows a model actually has, in sheet order.
 */
import type { AssetId } from './assets.generated';

export type Unit = 'mm' | 'kg' | 'w' | 'l' | 'c' | 'atm';

export type SpecKey =
  | 'centerDistance'
  | 'sectionSize'
  | 'sectionWeight'
  | 'heatOutput'
  | 'sectionVolume'
  | 'maxTemperature'
  | 'workingPressure'
  | 'testPressure';

export interface Spec {
  readonly key: SpecKey;
  /** Numeric value, formatted per locale (RU uses a decimal comma). */
  readonly value: number;
  /** Fixed decimal places; omit for integers. */
  readonly decimals?: number;
  /** Composite dimensions render verbatim instead of as a number. */
  readonly text?: string;
  readonly unit: Unit;
}

/** Section envelope in mm, split out of the printed "W x D x H" spec row. */
export interface SectionEnvelope {
  readonly width: number;
  readonly depth: number;
  readonly height: number;
}

export interface RadiatorModel {
  readonly slug: string;
  readonly name: string;
  /** Centre distance in mm. */
  readonly height: number;
  /** Drives the procedural 3D, so the models differ in size for real. */
  readonly section: SectionEnvelope;
  /** Key into the generated asset manifest. */
  readonly image: AssetId;
  readonly specs: readonly Spec[];
}

const mm = (value: number): Spec => ({ key: 'centerDistance', value, unit: 'mm' });
const size = (text: string): Spec => ({ key: 'sectionSize', value: 0, text, unit: 'mm' });
const kg = (value: number): Spec => ({ key: 'sectionWeight', value, decimals: 2, unit: 'kg' });
const watt = (value: number): Spec => ({ key: 'heatOutput', value, unit: 'w' });
const litre = (value: number): Spec => ({ key: 'sectionVolume', value, decimals: 2, unit: 'l' });
const celsius = (value: number): Spec => ({ key: 'maxTemperature', value, unit: 'c' });
const atmWork = (value: number): Spec => ({ key: 'workingPressure', value, unit: 'atm' });
const atmTest = (value: number): Spec => ({ key: 'testPressure', value, unit: 'atm' });

/** Ordered tallest to shortest, matching the factory lineup render. */
export const MODELS: readonly RadiatorModel[] = [
  {
    slug: 'infinity',
    name: 'INFINITY',
    height: 500,
    section: { width: 80, depth: 80, height: 553 },
    image: 'models/infinity',
    specs: [
      mm(500),
      size('80 × 80 × 553'),
      kg(1.64),
      watt(186),
      celsius(120),
      atmWork(16),
      atmTest(30),
    ],
  },
  {
    slug: 'elegant',
    name: 'ELEGANT',
    height: 500,
    section: { width: 95, depth: 80, height: 586 },
    image: 'models/elegant',
    specs: [
      mm(500),
      size('95 × 80 × 586'),
      kg(1.3),
      watt(198),
      litre(0.32),
      atmWork(16),
      atmTest(24),
    ],
  },
  {
    // Same family as ELEGANT, one step up: a slimmer 75 mm section that still
    // publishes the highest heat output in the range. The sheet also prints a
    // lower test pressure (20 atm) than the standard ELEGANT — transcribed, not
    // inherited.
    slug: 'elegant-premium',
    name: 'ELEGANT PREMIUM',
    height: 500,
    section: { width: 95, depth: 75, height: 576 },
    image: 'models/elegant-premium',
    specs: [
      mm(500),
      size('95 × 75 × 576'),
      kg(1.3),
      watt(230),
      litre(0.32),
      atmWork(16),
      atmTest(20),
    ],
  },
  {
    slug: 'classic',
    name: 'CLASSIC',
    height: 500,
    section: { width: 80, depth: 80, height: 575 },
    image: 'models/classic',
    specs: [
      mm(500),
      size('80 × 80 × 575'),
      kg(1.12),
      watt(190),
      litre(0.32),
      atmWork(16),
      atmTest(24),
    ],
  },
  {
    slug: 'bravo',
    name: 'BRAVO',
    height: 500,
    section: { width: 78, depth: 78, height: 565 },
    image: 'models/bravo',
    specs: [
      mm(500),
      size('78 × 78 × 565'),
      kg(0.83),
      watt(170),
      litre(0.32),
      atmWork(16),
      atmTest(30),
    ],
  },
  {
    slug: 'classic-350',
    name: 'CLASSIC 350',
    height: 350,
    section: { width: 80, depth: 80, height: 425 },
    image: 'models/classic-350',
    specs: [
      mm(350),
      size('80 × 80 × 425'),
      kg(0.86),
      watt(168),
      litre(0.3),
      atmWork(16),
      atmTest(24),
    ],
  },
];

/**
 * Real factory colourways, each backed by a photograph in the source assets
 * and framed identically so the switcher swaps like for like.
 */
export interface Colorway {
  readonly slug: string;
  /** Swatch chip fill, sampled from the corresponding render. */
  readonly hex: string;
  readonly image: AssetId;
}

export const COLORWAYS: readonly Colorway[] = [
  { slug: 'white', hex: '#EDEFF2', image: 'colors/white' },
  { slug: 'indigo', hex: '#2B3A87', image: 'colors/indigo' },
  { slug: 'green', hex: '#1F6B47', image: 'colors/green' },
  { slug: 'graphite', hex: '#5A544F', image: 'colors/graphite' },
  { slug: 'terracotta', hex: '#7E1B24', image: 'colors/terracotta' },
];

export function formatSpec(spec: Spec, locale: 'ru' | 'en'): string {
  if (spec.text) return spec.text;
  const fixed = spec.decimals ? spec.value.toFixed(spec.decimals) : String(spec.value);
  return locale === 'ru' ? fixed.replace('.', ',') : fixed;
}
