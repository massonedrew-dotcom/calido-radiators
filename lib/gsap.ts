'use client';

import { gsap } from 'gsap';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

/**
 * Single registration point. Importing plugins from more than one module makes
 * it easy to end up with a timeline that silently no-ops because the plugin was
 * tree-shaken out of that chunk.
 */
let registered = false;

if (typeof window !== 'undefined' && !registered) {
  gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin);
  // Sub-pixel transforms cost more than they are worth on long scrubs.
  gsap.config({ nullTargetWarn: false });
  gsap.defaults({ ease: 'power2.out', duration: 0.8 });
  registered = true;

  if (process.env.NODE_ENV !== 'production') {
    // Dev-only handle for driving the ticker by hand when inspecting scroll
    // choreography. Stripped from production builds.
    (window as unknown as Record<string, unknown>).__gsap = { gsap, ScrollTrigger };
  }
}

export { gsap, ScrollTrigger, SplitText, DrawSVGPlugin };
