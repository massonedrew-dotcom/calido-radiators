'use client';

import { useEffect } from 'react';

import { ScrollTrigger } from '@/lib/gsap';
import { PAGE_OF_SECTION, type PageId, type SectionId } from '@/lib/pages';

/**
 * Lands the visitor on the right section when the URL carries a hash.
 *
 * Cross-page forwarding for legacy `/#section` URLs is not done here: it runs
 * as a blocking inline script in the root layout, before hydration, because
 * replacing the document from an effect interrupted React mid-hydration and
 * left an empty page behind. See `legacyHashRedirect` in app/_shared/root.tsx.
 *
 * What is left is the scroll. The browser's own hash jump fires before the
 * webfont and the product images have resized anything, so it lands in the
 * wrong place and Lenis then holds it there. This waits for the layout to
 * settle and goes to the section properly.
 */
export function HashRouting({ page }: { page: PageId }) {
  useEffect(() => {
    const raw = window.location.hash.replace(/^#/, '');
    if (!raw) return;

    // Cross-page forwarding happens in a blocking inline script in the root
    // layout, before hydration. By the time this runs the URL is already the
    // right page, so all that is left is landing on the section.
    if (PAGE_OF_SECTION[raw as SectionId] !== page) return;

    // Same page: go to the section once the layout has stopped moving. The
    // settle pass in SmoothScroll fires a ScrollTrigger refresh when fonts and
    // images are done, which is the right moment to know about.
    let done = false;

    const jump = () => {
      if (done) return;
      const el = document.getElementById(raw);
      if (!el) return;
      done = true;
      const lenis = (
        window as unknown as { __lenis?: { scrollTo: (t: Element, o?: object) => void } }
      ).__lenis;
      // Negative offset clears the fixed header, same as in-page anchor clicks.
      if (lenis) lenis.scrollTo(el, { offset: -72, duration: 0.9 });
      else el.scrollIntoView();
    };

    /**
     * Never scroll from inside the refresh callback.
     *
     * The first version called `jump` directly from the listener and it threw
     * "Cannot read properties of undefined (reading 'end')" mid-hydration,
     * taking the whole page render with it: a refresh is part-way through
     * recomputing every trigger's start and end, and moving the scroll position
     * underneath it invalidates the measurements it is still reading. Two
     * frames of daylight puts the scroll after the refresh has finished.
     */
    const schedule = () => {
      if (done) return;
      requestAnimationFrame(() => requestAnimationFrame(jump));
    };

    ScrollTrigger.addEventListener('refresh', schedule);
    // Plain timeout, not gsap.delayedCall: the ticker is rAF-driven and this
    // has to fire even if no refresh ever happens (reduced motion, no images).
    const fallback = window.setTimeout(schedule, 1400);

    return () => {
      ScrollTrigger.removeEventListener('refresh', schedule);
      window.clearTimeout(fallback);
    };
  }, [page]);

  return null;
}
