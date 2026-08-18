'use client';

import { useRef, type ReactNode } from 'react';

import { gsap } from '@/lib/gsap';
import { useIdle, useIsomorphicLayoutEffect, useReducedMotion } from '@/lib/hooks';

/**
 * Draws a connection diagram: the pipe stubs appear, then the flow path is
 * stroked through the radiator in the direction the water actually travels.
 */
export function DrawnFlow({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const idle = useIdle();

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduced || !idle) return;

    const ctx = gsap.context(() => {
      const flow = el.querySelector('[data-flow]');
      const stubs = el.querySelectorAll('[data-stub]');
      if (!flow) return;

      gsap
        .timeline({ scrollTrigger: { trigger: el, start: 'top 86%', once: true } })
        .from(stubs, { autoAlpha: 0, duration: 0.35, stagger: 0.1, ease: 'power2.out' })
        .fromTo(
          flow,
          { drawSVG: '0%' },
          { drawSVG: '100%', duration: 1.1, ease: 'power2.inOut' },
          '-=0.15',
        );
    }, el);

    return () => ctx.revert();
  }, [reduced, idle]);

  return <div ref={ref}>{children}</div>;
}
