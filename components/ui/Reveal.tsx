'use client';

import { useRef, type ElementType, type ReactNode } from 'react';

import { gsap } from '@/lib/gsap';
import { useIdle, useIsomorphicLayoutEffect, useReducedMotion } from '@/lib/hooks';

/**
 * Baseline entrance used everywhere a section does not have a bespoke
 * timeline. Children carrying `data-reveal` are staggered; otherwise the
 * wrapper itself animates.
 *
 * Under reduced motion the elements are simply left at their resting state —
 * no transform is ever written, so nothing can be stranded mid-animation.
 */
export function Reveal({
  as: Tag = 'div',
  children,
  className = '',
  stagger = 0.08,
  y = 24,
  delay = 0,
  start = 'top 82%',
}: {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  stagger?: number;
  y?: number;
  delay?: number;
  start?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const idle = useIdle();

  // Resting state is written straight away, so nothing can flash in before its
  // trigger is armed a moment later.
  //
  // ...but only for the handful of blocks near the fold. There are fourteen of
  // these on the page and the eager write is a style-and-layout pass per
  // wrapper inside the hydration task, which is time the browser is not
  // spending on first paint. A block two screens down cannot flash, because it
  // cannot be seen: its resting state is written by the idle effect below,
  // before any scroll could bring it into view.
  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    if (el.getBoundingClientRect().top > window.innerHeight * 1.5) return;
    const targets = el.querySelectorAll<HTMLElement>('[data-reveal]');
    gsap.set(targets.length ? targets : el, { y, autoAlpha: 0 });
  }, [reduced, y]);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduced || !idle) return;

    const ctx = gsap.context(() => {
      const targets = el.querySelectorAll<HTMLElement>('[data-reveal]');
      const items: gsap.TweenTarget = targets.length ? targets : el;

      // `fromTo`, not `to`: blocks far below the fold never had their resting
      // state written by the effect above, so a `to` would tween them from
      // "already visible" to "visible" and they would simply never animate.
      // Stating both ends here makes the two paths identical, and the from
      // state renders immediately on creation — still long before any scroll
      // could reach them.
      gsap.fromTo(
        items,
        { y, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.9,
          delay,
          ease: 'power3.out',
          stagger: targets.length ? stagger : 0,
          scrollTrigger: { trigger: el, start, once: true },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [reduced, idle, stagger, y, delay, start]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
