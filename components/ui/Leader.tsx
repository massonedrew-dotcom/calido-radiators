'use client';

import { useRef } from 'react';

import { gsap } from '@/lib/gsap';
import { useIdle, useIsomorphicLayoutEffect, useReducedMotion } from '@/lib/hooks';

/**
 * The hairline under an anatomy callout, drawn out toward the product.
 *
 * A scaled border rather than an SVG line: it stays exactly one device pixel at
 * any width, and it animates on transform alone.
 */
export function Leader({ side, delay = 0 }: { side: 'left' | 'right'; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const idle = useIdle();

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    gsap.set(el, { scaleX: 0 });
  }, [reduced]);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduced || !idle) return;

    const ctx = gsap.context(() => {
      gsap.to(el, {
        scaleX: 1,
        duration: 0.9,
        delay,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      });
    }, el);

    return () => ctx.revert();
  }, [reduced, idle, delay]);

  return (
    <span
      ref={ref}
      aria-hidden
      className={`mt-4 block h-px bg-line-strong ${side === 'right' ? 'origin-right' : 'origin-left'}`}
    />
  );
}
