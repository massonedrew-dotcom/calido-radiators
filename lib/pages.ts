import { SURFACE_POLARITY, type Surface, type SurfaceId, type ThermalLayer } from '@/lib/thermal';

/**
 * The site, as one table.
 *
 * Routing, navigation, the section order on every page, and the temperature
 * each page sits at are all derived from here. Nothing about the structure is
 * declared twice, which is what stops the nav, the backdrop and the actual
 * page contents from drifting apart the way they did when the whole site was
 * one component.
 *
 * Slugs are identical across locales (`/models` and `/en/models`). Russian
 * transliterated slugs were considered and rejected: the two locales would then
 * have unrelated URLs for the same page, which makes the alternate-language
 * switch a lookup rather than a prefix swap.
 */

export type PageId = 'home' | 'about' | 'technology' | 'models' | 'installation' | 'contact';

/**
 * Every section on the site. Spelled out rather than inferred from PAGES,
 * because inference through `flatMap` widens to `string` and a mistyped id in
 * a `<Section>` would then compile and silently lose its surface polarity.
 */
export type SectionId =
  | 'hero'
  | 'benefits'
  | 'overview'
  | 'start'
  | 'about'
  | 'capacity'
  | 'quality'
  | 'warranty'
  | 'technology'
  | 'anatomy'
  | 'heat'
  | 'range'
  | 'scale'
  | 'colors'
  | 'systems'
  | 'connection'
  | 'contact';

export interface PageDef {
  readonly id: PageId;
  /** Path segment. Empty for the home page. */
  readonly slug: string;
  /** Sections rendered on this page, in order. Ids are unique site-wide. */
  readonly sections: readonly SectionId[];
  /**
   * Background stack for this page.
   *
   * Every layer on a page shares one polarity. That is Page Theme Lock: a page
   * never inverts under the reader. The site still travels from molten to cold
   * to lit and back, but it does it between pages rather than inside one.
   */
  readonly layers: readonly ThermalLayer[];
  /** True where this page appears in the primary nav. Home is the logo. */
  readonly inNav: boolean;
}

export const PAGES: readonly PageDef[] = [
  {
    id: 'home',
    slug: '',
    sections: ['hero', 'benefits', 'overview', 'start'],
    layers: [
      { surface: 'molten', from: 'hero', fade: 0 },
      { surface: 'cooling', from: 'overview', fade: 620 },
    ],
    inNav: false,
  },
  {
    id: 'about',
    slug: 'about',
    sections: ['about', 'capacity', 'quality', 'warranty'],
    layers: [
      { surface: 'cooling', from: 'about', fade: 0 },
      { surface: 'cinder', from: 'quality', fade: 700 },
    ],
    inNav: true,
  },
  {
    id: 'technology',
    slug: 'technology',
    sections: ['technology', 'anatomy', 'heat'],
    layers: [
      { surface: 'cinder', from: 'technology', fade: 0 },
      { surface: 'deep', from: 'anatomy', fade: 640 },
    ],
    inNav: true,
  },
  {
    id: 'models',
    slug: 'models',
    sections: ['range', 'scale', 'colors'],
    layers: [
      { surface: 'light', from: 'range', fade: 0 },
      { surface: 'lightWarm', from: 'colors', fade: 520 },
    ],
    inNav: true,
  },
  {
    id: 'installation',
    slug: 'installation',
    sections: ['systems', 'connection'],
    layers: [
      { surface: 'lightWarm', from: 'systems', fade: 0 },
      { surface: 'light', from: 'connection', fade: 520 },
    ],
    inNav: true,
  },
  {
    id: 'contact',
    slug: 'contact',
    sections: ['contact'],
    layers: [{ surface: 'close', from: 'contact', fade: 0 }],
    inNav: true,
  },
];

const byId = new Map(PAGES.map((p) => [p.id, p]));

export function getPage(id: PageId): PageDef {
  const page = byId.get(id);
  if (!page) throw new Error(`unknown page: ${id}`);
  return page;
}

/** `/models` for ru, `/en/models` for en. Trailing slash matches the export. */
export function pagePath(id: PageId, locale: 'ru' | 'en'): string {
  const { slug } = getPage(id);
  const base = locale === 'en' ? '/en' : '';
  if (!slug) return `${base}/`;
  return `${base}/${slug}/`;
}

/** Every section id on the site, in reading order. */
export const SECTION_IDS: readonly SectionId[] = PAGES.flatMap((p) => p.sections);

/**
 * Ink polarity per section.
 *
 * Section ids are unique across the site, so one flat lookup serves every page
 * and `Section` stays a server component with no page context to thread through
 * it. A section's polarity is whichever layer is on top when it is on screen.
 */
export const SURFACE: Record<SectionId, Surface> = (() => {
  const map = {} as Record<SectionId, Surface>;
  for (const page of PAGES) {
    let current: SurfaceId = page.layers[0]!.surface;
    let next = 1;
    for (const section of page.sections) {
      const layer = page.layers[next];
      if (layer && layer.from === section) {
        current = layer.surface;
        next += 1;
      }
      map[section] = SURFACE_POLARITY[current];
    }
  }
  return map;
})();

/** Which page a given section lives on. Used by the progress rail and header. */
export const PAGE_OF_SECTION = Object.fromEntries(
  PAGES.flatMap((p) => p.sections.map((s) => [s, p.id])),
) as Record<SectionId, PageId>;

/**
 * Polarity per page.
 *
 * Page Theme Lock means every layer on a page shares one polarity, so the first
 * layer answers for the whole page. Read by `buildViewport` to decide what the
 * browser's own UI - form controls, autofill, the address bar - should be told
 * this page is.
 */
export const PAGE_POLARITY: Record<PageId, Surface> = Object.fromEntries(
  PAGES.map((p) => [p.id, SURFACE_POLARITY[p.layers[0]!.surface]]),
) as Record<PageId, Surface>;
