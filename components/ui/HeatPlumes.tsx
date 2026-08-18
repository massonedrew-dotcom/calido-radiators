'use client';

import { useMemo, useRef } from 'react';

import { gsap, ScrollTrigger } from '@/lib/gsap';
import {
  useIdle,
  useIsDesktop,
  useIsomorphicLayoutEffect,
  useReducedMotion,
} from '@/lib/hooks';

/**
 * Convection rising off the fins.
 *
 * Each plume is a single path translated on a looping timeline — transform and
 * opacity only, so the whole field composites without repainting. Density is
 * scrubbed: the further into the section you are, the more plumes have joined,
 * which is the one place the page shows heat *increasing* rather than fading.
 */

const COUNT = 14;

interface Plume {
  readonly x: number;
  readonly delay: number;
  readonly duration: number;
  readonly scale: number;
  readonly drift: number;
}

/** Deterministic so the server and client markup agree. */
function makePlumes(): Plume[] {
  let seed = 20150;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  return Array.from({ length: COUNT }, (_, i) => ({
    x: 4 + (i + rand() * 0.6) * (92 / COUNT),
    delay: rand() * 3.2,
    duration: 3.4 + rand() * 2.6,
    scale: 0.6 + rand() * 0.7,
    drift: (rand() - 0.5) * 10,
  }));
}

export function HeatPlumes({ className = '' }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const reduced = useReducedMotion();
  const idle = useIdle();
  const desktop = useIsDesktop();
  const plumes = useMemo(makePlumes, []);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    // Fourteen timelines looping forever is not something to hand a phone —
    // and the brief asks mobile to come down to plain vertical reveals.
    if (!el || reduced || !idle || !desktop) return;

    const ctx = gsap.context(() => {
      const nodes = gsap.utils.toArray<SVGGElement>('[data-plume]', el);

      nodes.forEach((node, i) => {
        const plume = plumes[i];
        if (!plume) return;

        // Opacity is driven from onUpdate rather than tweened: the plume has to
        // fade in and back out within one pass, and a second tween on the same
        // property would just fight this one.
        gsap.fromTo(
          node,
          { yPercent: 12, scaleY: 0.7 },
          {
            yPercent: -78,
            scaleY: 1.25,
            x: plume.drift,
            duration: plume.duration,
            delay: plume.delay,
            ease: 'sine.out',
            repeat: -1,
            onUpdate() {
              node.style.opacity = String(Math.sin(Math.PI * this.progress()) * 0.55);
            },
          },
        );
      });

      // Plumes join progressively as the section is scrolled through.
      ScrollTrigger.create({
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          const live = Math.round(self.progress * nodes.length);
          nodes.forEach((n, i) => {
            n.style.visibility = i < live ? 'visible' : 'hidden';
          });
        },
      });
    }, el);

    return () => ctx.revert();
  }, [reduced, idle, desktop, plumes]);

  if (!desktop || reduced) return null;

  return (
    <svg
      ref={ref}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
      focusable="false"
      className={`pointer-events-none ${className}`}
    >
      <defs>
        <linearGradient id="plume-fade" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="var(--color-red-600)" stopOpacity="0.75" />
          <stop offset="100%" stopColor="var(--color-red-600)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {plumes.map((p, i) => (
        <g key={i} data-plume style={{ visibility: 'hidden', transformOrigin: 'center bottom' }}>
          <path
            d={`M${p.x} 96 C ${p.x - 2.4} 74, ${p.x + 2.4} 58, ${p.x} 34`}
            fill="none"
            stroke="url(#plume-fade)"
            strokeWidth={1.6 * p.scale}
            strokeLinecap="round"
          />
        </g>
      ))}
    </svg>
  );
}
