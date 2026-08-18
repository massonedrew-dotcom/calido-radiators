'use client';

import { useEffect, useLayoutEffect, useState } from 'react';

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
