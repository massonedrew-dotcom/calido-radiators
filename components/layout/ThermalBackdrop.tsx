'use client';

import { useRef } from 'react';

import { getPage, type PageId } from '@/lib/pages';
import { SURFACES } from '@/lib/thermal';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useIsomorphicLayoutEffect } from '@/lib/hooks';

/**
 * The one background on the site.
 *
 * Every section is transparent; this fixed stack is what the visitor actually
 * sees behind all of them, and it moves through the temperature story in
 * lib/thermal.ts as the page scrolls. Because it is one continuous surface
 * there is no such thing as a section edge for it to break on — the seams the
 * rebuild set out to remove cannot exist here by construction.
 *
 * Only `opacity` is written, and only through a quickSetter, so the whole
 * effect stays on the compositor: six viewport-sized layers cost one GPU blend
 * each and zero repaints.
 */

/** Hermite ramp. Linear crossfades read as a hard start and a hard stop. */
function smoothstep(edge0: number, edge1: number, x: number) {
  if (edge1 <= edge0) return x < edge0 ? 0 : 1;
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export function ThermalBackdrop({ page }: { page: PageId }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const layers = getPage(page).layers;

  useIsomorphicLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (layers.length < 2) return; // single-surface page: nothing to crossfade

    const nodes = Array.from(host.children) as HTMLElement[];
    // Layer 0 is the floor and never animates, so it is not in the setter list.
    const setters = nodes
      .slice(1)
      .map((n) => gsap.quickSetter(n, 'opacity') as (v: number) => void);

    /** Document-space centre of each layer's crossfade, filled on refresh. */
    let boundaries: number[] = [];
    let viewportHalf = window.innerHeight / 2;

    const measure = () => {
      viewportHalf = window.innerHeight / 2;
      boundaries = layers.slice(1).map((layer) => {
        const el = document.getElementById(layer.from);
        // A missing section must not collapse the whole ramp to zero, which
        // would park every later layer permanently on.
        return el ? el.getBoundingClientRect().top + window.scrollY : Number.POSITIVE_INFINITY;
      });
    };

    const apply = (scroll: number) => {
      // Sampled at the viewport centre rather than its top edge: the layer a
      // visitor perceives as "the background" is the one filling the middle of
      // the screen, and sampling there keeps the handover symmetric.
      const y = scroll + viewportHalf;
      for (let i = 0; i < setters.length; i++) {
        const b = boundaries[i]!;
        const half = layers[i + 1]!.fade / 2;
        setters[i]!(smoothstep(b - half, b + half, y));
      }
    };

    measure();
    apply(window.scrollY);

    const trigger = ScrollTrigger.create({
      // Deliberately not `trigger: documentElement, end: 'bottom bottom'`.
      // That resolves against the root element's border box, which on this page
      // is 14 001px while the real scroll range is 17 373 — pin spacers and
      // overflowing children do not count toward it. The trigger therefore went
      // inactive a fifth of the way from the bottom and the last thermal layer
      // could never arrive. `maxScroll` is the authoritative number, and a
      // function-valued end re-resolves it on every refresh.
      start: 0,
      end: () => ScrollTrigger.maxScroll(window),
      onUpdate: (self) => apply(self.scroll()),
      onRefresh: (self) => {
        measure();
        apply(self.scroll());
      },
    });

    return () => trigger.kill();
  }, [layers]);

  return (
    <div ref={hostRef} aria-hidden className="pointer-events-none fixed inset-0 z-0">
      {layers.map((layer, i) => (
        <div
          key={layer.surface}
          data-thermal={layer.surface}
          className="absolute inset-0"
          style={{
            background: SURFACES[layer.surface],
            // Server-rendered at the top of the page, which is where every
            // visit starts, so the first paint is already correct.
            opacity: i === 0 ? 1 : 0,
            /**
             * No `will-change` here, and not by omission.
             *
             * Declaring it statically allocates five viewport-sized GPU
             * textures before first paint. Toggling it per frame instead —
             * promoting only the layer mid-crossfade — was worse still: it
             * thrashes layer creation on a full-screen gradient and took
             * mobile TBT from 230ms to 6.8s in a measured run. Chrome
             * auto-promotes an element whose opacity is actually changing,
             * which is the behaviour wanted here anyway.
             */
          }}
        />
      ))}
    </div>
  );
}
