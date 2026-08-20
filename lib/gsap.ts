'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Single registration point. Importing plugins from more than one module makes
 * it easy to end up with a timeline that silently no-ops because the plugin was
 * tree-shaken out of that chunk.
 *
 * ScrollTrigger is eager because something is scroll-linked on every screen of
 * the page, including the first. SplitText and DrawSVG are not: the first is
 * desktop-only, the second only runs on line art that is all below the fold.
 * Both are behind `loadDrawSVG` / `loadSplitText` below, which is worth the
 * indirection — the mobile audit attributed 1 150ms of LCP to element render
 * delay, i.e. paint waiting on hydration, and these two plugins were ~28 kB of
 * script being parsed in that window for nothing.
 */
let registered = false;

/**
 * Scrub lag, in seconds.
 *
 * `scrub: true` ties the timeline head to the scroll position with no
 * smoothing, so every jitter in the wheel or trackpad delta is reproduced
 * exactly — which is what the audit saw as animations that "run in jerks".
 * A one-second catch-up is the standard fix and is used by every scrubbed
 * timeline on the site; nothing imports a literal.
 */
export const SCRUB = 1;

if (typeof window !== 'undefined' && !registered) {
  gsap.registerPlugin(ScrollTrigger);
  // Sub-pixel transforms cost more than they are worth on long scrubs.
  gsap.config({ nullTargetWarn: false });
  // One easing and one duration for the whole site. Anything that wants a
  // different curve has to say so at the call site, which makes the exceptions
  // visible in review instead of accumulating quietly.
  //
  // Note this is deliberately NOT `ScrollTrigger.defaults({ scrub })`: that
  // would attach a scrub to the one-shot reveal triggers too and convert every
  // entrance animation on the page into a scroll-scrubbed one.
  gsap.defaults({ ease: 'power2.out', duration: 0.8 });
  registered = true;

  if (process.env.NODE_ENV !== 'production') {
    // Dev-only handle for driving the ticker by hand when inspecting scroll
    // choreography. Stripped from production builds.
    (window as unknown as Record<string, unknown>).__gsap = { gsap, ScrollTrigger };
  }
}

/**
 * Lazily registers DrawSVG and resolves once it is usable.
 *
 * Every caller already defers its timeline to idle, so the extra await costs
 * nothing observable; the plugin is registered exactly once no matter how many
 * components ask for it.
 */
let drawSVG: Promise<void> | undefined;
export function loadDrawSVG(): Promise<void> {
  drawSVG ??= import('gsap/DrawSVGPlugin').then(({ DrawSVGPlugin }) => {
    gsap.registerPlugin(DrawSVGPlugin);
  });
  return drawSVG;
}

/** Same, for SplitText, which only the desktop headline treatment uses. */
let splitText: Promise<typeof import('gsap/SplitText').SplitText> | undefined;
export function loadSplitText() {
  splitText ??= import('gsap/SplitText').then(({ SplitText }) => {
    gsap.registerPlugin(SplitText);
    return SplitText;
  });
  return splitText;
}

export { gsap, ScrollTrigger };
export type { SplitText } from 'gsap/SplitText';
