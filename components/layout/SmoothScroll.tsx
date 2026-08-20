'use client';

import Lenis from 'lenis';
import { useEffect, useRef } from 'react';

import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useReducedMotion } from '@/lib/hooks';

/**
 * Owns scrolling: the Lenis instance, and the remeasure pass that everything
 * scroll-linked on the page depends on.
 *
 * Lenis is driven from gsap.ticker rather than its own rAF loop. Two
 * independent loops would read and write the scroll position in an undefined
 * order, which shows up as jitter on every scrubbed timeline.
 */
export function SmoothScroll() {
  const reduced = useReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      smoothWheel: true,
      // Native momentum on touch beats an emulated one.
      syncTouch: false,
      touchMultiplier: 1.6,
    });
    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    if (process.env.NODE_ENV !== 'production') {
      // Dev-only handle. Lenis owns the scroll position, so a plain
      // `window.scrollTo` from a console or a test harness is overwritten on
      // the next rAF, and every scroll-linked measurement taken after it is a
      // reading of the wrong frame. Anything driving this page
      // programmatically has to go through the instance.
      (window as unknown as Record<string, unknown>).__lenis = lenis;
    }

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // In-page anchors have to go through Lenis or they teleport.
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement | null)?.closest('a[href^="#"]');
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const id = anchor.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      // Negative offset clears the fixed header, which would otherwise cover
      // the first 72px of whatever section was just jumped to — the reported
      // "heading cut off at the top".
      lenis.scrollTo(target as HTMLElement, { offset: -72, duration: 1.2 });
    };

    document.addEventListener('click', onClick);

    return () => {
      document.removeEventListener('click', onClick);
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduced]);

  /**
   * Remeasure once the page has stopped growing.
   *
   * Every ScrollTrigger start/end — and Lenis's own scroll limit — is computed
   * from the document height at the moment it is created, which is before the
   * webfont swaps and before a single product image has decoded. The audit
   * found the damage at both ends: Lenis was clamping the page at 13 101px
   * against a real limit of 16 473, leaving the last sections unreachable, and
   * triggers were evaluating against offsets the elements never occupied —
   * which is what "the card content does not appear until you scroll past it"
   * actually was. The reveal had already been marked done.
   *
   * Fonts and images are awaited specifically, rather than `load`, because
   * `load` also blocks on subresources that cannot move the layout. A
   * ResizeObserver then catches anything that settles later still.
   *
   * Runs regardless of reduced motion: the header state, the progress rail and
   * the thermal backdrop are all scroll-linked and all need correct offsets
   * even when nothing is animating.
   */
  useEffect(() => {
    let cancelled = false;
    let settled = false;
    let debounce: ReturnType<typeof setTimeout>;

    const remeasure = () => {
      lenisRef.current?.resize();
      ScrollTrigger.refresh();
    };

    const settle = async () => {
      try {
        await document.fonts.ready;
      } catch {
        /* Fonts API unavailable — the image wait below is still worth doing. */
      }
      await Promise.all(
        Array.from(document.images)
          .filter((img) => !img.complete)
          .map(
            (img) =>
              new Promise<void>((resolve) => {
                img.addEventListener('load', () => resolve(), { once: true });
                img.addEventListener('error', () => resolve(), { once: true });
              }),
          ),
      );
      if (cancelled) return;
      settled = true;
      remeasure();
    };
    void settle();

    // Debounced: a refresh re-measures every trigger on the page, and a lazy
    // image landing below the fold would otherwise trigger one per decode.
    const observer = new ResizeObserver(() => {
      if (!settled) return;
      clearTimeout(debounce);
      debounce = setTimeout(remeasure, 180);
    });
    observer.observe(document.body);

    return () => {
      cancelled = true;
      observer.disconnect();
      clearTimeout(debounce);
    };
  }, []);

  return null;
}
