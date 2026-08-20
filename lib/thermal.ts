/**
 * The temperature vocabulary.
 *
 * The site tells a foundry story: melt, cooling, cinder, cold metal, finished
 * product, and a red call to action at the end. Every background on the site is
 * drawn from the six surfaces below and nothing else.
 *
 * What changed in the multi-page rebuild: the arc used to run top-to-bottom
 * through one very long page, which meant the page inverted from dark to light
 * and back inside a single scroll. That is a Page Theme Lock violation (skill
 * §4.11) and it was also just hard to read - the visitor felt they had walked
 * into a different site halfway down.
 *
 * Now the arc runs across the *site*. Each page holds one polarity and moves
 * through two neighbouring surfaces of the same family, so a page never flips
 * under you, and the journey is still there when you walk the nav in order.
 *
 * Layers stack and latch: layer *i* fades from 0 to 1 across a window centred
 * on its entry point and then stays. Every layer is opaque, so nothing beneath
 * shows through a completed handover. Opacity is also the only property that
 * crossfades on the compositor, which is why this is six stacked elements
 * rather than one repainted gradient.
 */

export type Surface = 'dark' | 'light';

/** The six surfaces, as CSS backgrounds. Referenced by id from lib/pages.ts. */
export const SURFACES = {
  /** Hero. Ember core over the headline, cooling to a dark cherry at the fold. */
  molten:
    'radial-gradient(125% 100% at 50% -6%, #ff7a3c 0%, #e8412e 16%, #d91222 32%, #7d0b16 62%, #380810 100%)',

  /** Off the burner. Same hue, two stops down in lightness. */
  cooling: 'linear-gradient(180deg, #6d0b14 0%, #4e080f 42%, #300711 78%, #1d0714 100%)',

  /**
   * The hue pivot, and it happens at the bottom of the lightness range on
   * purpose: at 6% saturation there is no violet to be had between red and
   * indigo. Routing the transition through here is what keeps the muddy purple
   * out of the site entirely.
   */
  cinder: 'linear-gradient(180deg, #1d0714 0%, #170a24 38%, #101034 72%, #0d1338 100%)',

  /** Cold metal. The deep indigo the brand owns. */
  deep: 'linear-gradient(180deg, #0d1338 0%, #131b4c 46%, #1b2765 100%)',

  /** The finished product, lit. Tinted, never #FFFFFF. */
  light: 'linear-gradient(180deg, #e3e7f6 0%, #eef0f8 34%, #e9ecf7 68%, #dfe4f4 100%)',

  /** A half-step of the light surface, so a light page still travels. */
  lightWarm: 'linear-gradient(180deg, #eef0f8 0%, #e7ebf7 40%, #dfe4f4 100%)',

  /** Back into indigo with the red accent returning under the CTA. */
  close:
    'radial-gradient(120% 80% at 50% 118%, #a20d1a 0%, #4a0c25 26%, #171d51 58%, #0d1338 100%)',
} as const;

export type SurfaceId = keyof typeof SURFACES;

/**
 * A flat stand-in for each surface.
 *
 * The gradients above are painted by a `position: fixed` stack, which is not an
 * ancestor of anything, so an automated contrast checker walking up the DOM
 * never finds them and falls back to the root background. On the single-page
 * build that produced 40 unresolvable failures on the light half of the site.
 *
 * With one polarity per page, `main` can carry an opaque base colour that the
 * checker does find. It is invisible: the thermal stack renders inside `main`
 * and above this, so what a human sees is unchanged. What changes is that axe
 * now measures against a colour in the right family instead of against
 * indigo-900.
 */
export const SURFACE_BASE: Record<SurfaceId, string> = {
  molten: '#7d0b16',
  cooling: '#4e080f',
  cinder: '#170a24',
  deep: '#131b4c',
  light: '#e6eaf7',
  lightWarm: '#e7ebf7',
  close: '#171d51',
};

/** Which polarity each surface carries. Drives every ink token on the page. */
export const SURFACE_POLARITY: Record<SurfaceId, Surface> = {
  molten: 'dark',
  cooling: 'dark',
  cinder: 'dark',
  deep: 'dark',
  light: 'light',
  lightWarm: 'light',
  close: 'dark',
};

export interface ThermalLayer {
  readonly surface: SurfaceId;
  /**
   * Section this layer takes over at. The crossfade is centred on that
   * section's top edge. The first layer of a page has no boundary and is
   * always on.
   */
  readonly from: import('@/lib/pages').SectionId;
  /** Crossfade length in px, centred on the boundary. */
  readonly fade: number;
}

/**
 * The colour the browser's own chrome should take, per polarity.
 *
 * This is what `<meta name="theme-color">` carries: the phone's address bar,
 * the task-switcher card, the PWA status bar. It is not a surface - it is the
 * flat colour the browser paints next to the page, so it takes the base of the
 * family the page sits in rather than any one gradient stop.
 */
export const CHROME_COLOR: Record<Surface, string> = {
  dark: '#0d1338',
  light: SURFACE_BASE.light,
};
