import type { PlateId } from '@/lib/plates';

/**
 * The site, as one table.
 *
 * Routing, navigation, the section order on every page, and the plate colour
 * each page opens on are all derived from here. Nothing about the structure is
 * declared twice, which is what stops the nav, the page headers and the actual
 * page contents from drifting apart.
 *
 * Slugs are identical across locales (`/models` and `/en/models`). Russian
 * transliterated slugs were considered and rejected: the two locales would then
 * have unrelated URLs for the same page, which makes the alternate-language
 * switch a lookup rather than a prefix swap.
 *
 * What left this file in the white rebuild: the `layers` array, which described
 * a gradient stack that faded between molten red and deep indigo as the page
 * scrolled, and the `SURFACE` / `PAGE_POLARITY` maps derived from it. Every
 * page is white now, so a section's ink polarity is a constant rather than a
 * function of scroll position, and only a plate declares otherwise — locally,
 * on itself. See lib/plates.ts.
 */

export type PageId = 'home' | 'about' | 'technology' | 'models' | 'installation' | 'contact';

/**
 * Every section on the site. Spelled out rather than inferred from PAGES,
 * because inference through `flatMap` widens to `string` and a mistyped id in
 * a `<Section>` would then compile.
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
   * Fill of this page's opening plate — the band under the header carrying the
   * page title and the breadcrumb.
   *
   * Indigo is the default because it is the brand's own colour and it can carry
   * a heading at any size. Red is reserved for the page whose entire job is the
   * call to action, so that "red band" means one thing site-wide rather than
   * being the general-purpose header colour it was when the home page opened on
   * a full-bleed molten gradient.
   */
  readonly plate: PlateId;
  /** True where this page appears in the primary nav. Home is the logo. */
  readonly inNav: boolean;
}

export const PAGES: readonly PageDef[] = [
  {
    id: 'home',
    slug: '',
    sections: ['hero', 'benefits', 'overview', 'start'],
    // The home page opens on the hero, not on a page-header plate, so this is
    // the accent its own plates take rather than a band colour.
    plate: 'indigo',
    inNav: false,
  },
  {
    id: 'about',
    slug: 'about',
    sections: ['about', 'capacity', 'quality', 'warranty'],
    plate: 'indigo',
    inNav: true,
  },
  {
    id: 'technology',
    slug: 'technology',
    sections: ['technology', 'anatomy', 'heat'],
    plate: 'ink',
    inNav: true,
  },
  {
    id: 'models',
    slug: 'models',
    sections: ['range', 'scale', 'colors'],
    plate: 'indigo',
    inNav: true,
  },
  {
    id: 'installation',
    slug: 'installation',
    sections: ['systems', 'connection'],
    plate: 'ink',
    inNav: true,
  },
  {
    id: 'contact',
    slug: 'contact',
    sections: ['contact'],
    plate: 'red',
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

/** Which page a given section lives on. Used by the progress rail and header. */
export const PAGE_OF_SECTION = Object.fromEntries(
  PAGES.flatMap((p) => p.sections.map((s) => [s, p.id])),
) as Record<SectionId, PageId>;
