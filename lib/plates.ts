/**
 * The plate vocabulary.
 *
 * What this replaces: `lib/thermal.ts`, which painted the whole site as one
 * continuous molten-to-indigo gradient behind transparent sections. That is why
 * the home page opened red and why the WebGL melt existed at all — the shader
 * was the top layer of that stack.
 *
 * The rule now is the opposite and it is one line: **the page is white, and
 * colour arrives as plates laid on top of it.** A plate is an opaque rectangle
 * of one brand colour carrying its own ink polarity — the topbar strip, the
 * page-header block, the overhanging icon squares on a feature card, a stat
 * block, the closing CTA band, the footer. Nothing bleeds, nothing crossfades,
 * and there is no section whose background depends on how far the visitor has
 * scrolled.
 *
 * Two consequences worth stating, because both were problems before:
 *   · a contrast checker walking up the DOM from any text node now lands on an
 *     opaque ancestor — either white or one plate colour — so nothing has to be
 *     measured against a gradient that is not an ancestor of anything;
 *   · a page cannot invert under the reader, because a plate is a box with
 *     edges rather than a viewport-sized layer that fades in.
 */

/** Ink polarity a surface demands. */
export type Surface = 'light' | 'dark';

/**
 * Every fill a plate is allowed to take.
 *
 * Deliberately short. Five entries, drawn from the two brand families in
 * styles/tokens.css and nothing else — the moment this list grows a sixth hue
 * the "white page, brand plates" reading is gone.
 */
export const PLATES = {
  /** The workhorse. Section headers, stat blocks, the footer's parent family. */
  indigo: { fill: '#22337e', polarity: 'dark' },
  /** The floor colour, used where a plate needs to read as heavier than indigo. */
  ink: { fill: '#0d1338', polarity: 'dark' },
  /** Accent only: CTAs, the active step, the one figure that must be read first. */
  red: { fill: '#d91222', polarity: 'dark' },
  /** The quiet plate — a tinted panel on white, still light polarity. */
  paper: { fill: '#eef0f8', polarity: 'light' },
  /** A plate that is white but bounded, i.e. carried by its hairline. */
  white: { fill: '#ffffff', polarity: 'light' },
} as const;

export type PlateId = keyof typeof PLATES;

export const PLATE_POLARITY: Record<PlateId, Surface> = {
  indigo: 'dark',
  ink: 'dark',
  red: 'dark',
  paper: 'light',
  white: 'light',
};

/** The page floor. There is exactly one and it is not negotiable per page. */
export const PAGE_BASE = '#ffffff';

/**
 * What `<meta name="theme-color">` carries: the phone's address bar, the
 * task-switcher card, the PWA status bar.
 *
 * It used to be per-page, keyed to the thermal surface that page sat on. With
 * one white floor site-wide there is one answer, and it is the floor.
 */
export const CHROME_COLOR = PAGE_BASE;
