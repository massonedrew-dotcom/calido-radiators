'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

type LenisLike = {
  on: (event: 'scroll', cb: () => void) => void;
  off: (event: 'scroll', cb: () => void) => void;
};

/**
 * Subscribe to scroll position.
 *
 * `window.addEventListener('scroll', …)` does not work on this site, and it is
 * worth stating plainly because it looks like it should: Lenis puts
 * `overflow: clip` on html and body and moves the page itself, so the browser
 * fires no native scroll event at all. Measured on /models/ — a 2200px
 * programmatic scroll produced zero window scroll events and zero document
 * ones, while `lenis.on('scroll')` fired normally. Anything watching scroll
 * has to go through the instance.
 *
 * Both subscriptions are attached anyway, because exactly one of them is ever
 * live: with Lenis running the native event never fires, and on the
 * reduced-motion path Lenis is never created and the browser scrolls the page
 * itself. That is also why this cannot be "use Lenis, else use window" — which
 * of the two applies is a media query away from changing.
 *
 * The Lenis handle is attached to immediately if it is already there, and
 * otherwise on the `lenis:ready` event SmoothScroll fires when it creates one.
 * The obvious alternative — look again next animation frame — is wrong in a
 * way that is easy to miss: a page opened in a background tab gets no frames
 * at all, so the subscription would arm only once the visitor switched to it.
 * An event has no such dependency, and it also removes the assumption that
 * SmoothScroll's effect happens to run before this one.
 */
export function useScrollPosition(onScroll: (y: number) => void): void {
  const latest = useRef(onScroll);
  latest.current = onScroll;

  useEffect(() => {
    const fire = () => latest.current(window.scrollY);
    fire();

    window.addEventListener('scroll', fire, { passive: true });

    let attached: LenisLike | undefined;
    const attach = () => {
      const lenis = (window as unknown as { __lenis?: LenisLike }).__lenis;
      if (!lenis || attached === lenis) return;
      lenis.on('scroll', fire);
      attached = lenis;
      fire();
    };

    attach();
    window.addEventListener('lenis:ready', attach);

    return () => {
      window.removeEventListener('lenis:ready', attach);
      window.removeEventListener('scroll', fire);
      attached?.off('scroll', fire);
    };
  }, []);
}

/** useLayoutEffect that does not warn during SSR. */
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Live media-query subscription. Returns `null` until mounted so callers can
 * tell "not measured yet" apart from "false", which matters when the answer
 * decides whether to build a scroll timeline at all.
 */
export function useMedia(query: string): boolean | null {
  const [matches, setMatches] = useState<boolean | null>(null);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** True when the visitor has asked for reduced motion. */
export function useReducedMotion(): boolean {
  return useMedia('(prefers-reduced-motion: reduce)') === true;
}

/**
 * Desktop is where WebGL and horizontal pinning are allowed. Anything narrower
 * or coarse-pointered falls back to vertical reveals.
 */
export function useIsDesktop(): boolean | null {
  return useMedia('(min-width: 64rem) and (pointer: fine)');
}

/**
 * Flips true once the browser has gone idle after hydration.
 *
 * Creating every ScrollTrigger on the page at once measures layout dozens of
 * times inside the hydration task. Holding the non-critical ones until idle
 * moves that work out of the block that Lighthouse counts, at the cost of the
 * scroll choreography arming a beat later — which is invisible, because none of
 * it can trigger before the visitor has scrolled anyway.
 */
export function useIdle(): boolean {
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(() => setIdle(true), { timeout: 1200 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(() => setIdle(true), 200);
    return () => window.clearTimeout(id);
  }, []);

  return idle;
}
