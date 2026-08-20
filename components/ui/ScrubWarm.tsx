'use client';

import { useRef, type ReactNode } from 'react';

import { SCRUB, gsap } from '@/lib/gsap';
import { useIdle, useIsomorphicLayoutEffect, useReducedMotion } from '@/lib/hooks';

/**
 * Warms an interior frame as it is scrolled through: a red-100 wash spreads out
 * from the radiator on the wall while the room's light turns fractionally
 * warmer.
 *
 * The wash is a separate absolutely-positioned layer animated on opacity alone.
 * The light shift is a CSS filter on the photograph, which does cost a repaint —
 * it is kept to a single element and a very small range for that reason.
 */
export function ScrubWarm({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const idle = useIdle();

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduced || !idle) return;

    const ctx = gsap.context(() => {
      const wash = el.querySelector('[data-warm-wash]');
      const photo = el.querySelector('[data-warm-photo]');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top 78%',
          end: 'bottom 40%',
          scrub: SCRUB,
        },
      });

      if (wash) tl.fromTo(wash, { autoAlpha: 0 }, { autoAlpha: 1, ease: 'none' }, 0);
      if (photo) {
        tl.fromTo(
          photo,
          { filter: 'saturate(0.94) brightness(1)' },
          { filter: 'saturate(1.06) brightness(1.03)', ease: 'none' },
          0,
        );
      }
    }, el);

    return () => ctx.revert();
  }, [reduced, idle]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
