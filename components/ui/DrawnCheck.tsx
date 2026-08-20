'use client';

import { useRef } from 'react';

import { gsap, loadDrawSVG } from '@/lib/gsap';
import { useIdle, useIsomorphicLayoutEffect, useReducedMotion } from '@/lib/hooks';

/**
 * Verification mark: the ring is stroked around, then the tick is drawn inside.
 *
 * DrawSVG animates `stroke-dashoffset`, which is a paint-level change rather
 * than a composited one. That is fine here — these are a handful of 44px glyphs
 * that draw once — but it is the reason nothing larger uses this technique.
 */
export function DrawnCheck({
  size = 44,
  className = '',
  delay = 0,
}: {
  size?: number;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const reduced = useReducedMotion();
  const idle = useIdle();

  // Undrawn immediately, armed at idle — otherwise eight of these each measure
  // layout inside the hydration task.
  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    let cancelled = false;
    // DrawSVG is registered on demand (lib/gsap.ts), so even the resting state
    // has to wait for it — `drawSVG: '0%'` is a plugin property.
    void loadDrawSVG().then(() => {
      if (cancelled) return;
      gsap.set(el.querySelectorAll('[data-ring], [data-tick]'), { drawSVG: '0%' });
    });
    return () => {
      cancelled = true;
    };
  }, [reduced]);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduced || !idle) return;

    let ctx: gsap.Context | undefined;
    let cancelled = false;

    void loadDrawSVG().then(() => {
      if (cancelled) return;
      ctx = gsap.context(() => {
      const ring = el.querySelector('[data-ring]');
      const tick = el.querySelector('[data-tick]');
      if (!ring || !tick) return;

      gsap
        .timeline({
          defaults: { ease: 'power2.inOut' },
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          delay,
        })
        .to(ring, { drawSVG: '100%', duration: 0.7 })
        .to(tick, { drawSVG: '100%', duration: 0.35 }, '-=0.15');
      }, el);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [reduced, idle, delay]);

  return (
    <svg
      ref={ref}
      viewBox="0 0 44 44"
      width={size}
      height={size}
      aria-hidden
      focusable="false"
      fill="none"
      stroke="var(--color-mark)"
      strokeWidth={1.4}
      className={className}
    >
      <circle cx="22" cy="22" r="21" data-ring />
      <path
        d="M13 22.5l6.2 6.2L31.5 16.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        data-tick
      />
    </svg>
  );
}

/** Small inline tick used in dense lists, drawn on the same trigger. */
export function DrawnTick({ className = '' }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    let ctx: gsap.Context | undefined;
    let cancelled = false;

    void loadDrawSVG().then(() => {
      if (cancelled) return;
      ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelector('path'),
        { drawSVG: '0%' },
        {
          drawSVG: '100%',
          duration: 0.4,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        },
      );
      }, el);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [reduced]);

  return (
    <svg
      ref={ref}
      viewBox="0 0 14 14"
      width="13"
      height="13"
      aria-hidden
      focusable="false"
      fill="none"
      stroke="var(--color-mark)"
      strokeWidth="1.8"
      className={className}
    >
      <path d="M2 7.5l3.4 3.4L12 3.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
