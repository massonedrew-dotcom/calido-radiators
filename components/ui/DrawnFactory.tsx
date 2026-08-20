'use client';

import { useRef } from 'react';

import { gsap, loadDrawSVG } from '@/lib/gsap';
import { useIdle, useIsomorphicLayoutEffect, useReducedMotion } from '@/lib/hooks';

/**
 * Line-drawn plant, stroked on as the section enters. The ground line goes
 * first, then the building, then the details — so it reads as being drawn
 * rather than as several shapes appearing at once.
 */
export function DrawnFactory({ title, className = '' }: { title: string; className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const reduced = useReducedMotion();
  const idle = useIdle();

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduced || !idle) return;

    let ctx: gsap.Context | undefined;
    let cancelled = false;

    void loadDrawSVG().then(() => {
      if (cancelled) return;
      ctx = gsap.context(() => {
      const paths = gsap.utils.toArray<SVGPathElement>('path, rect', el);

      gsap.fromTo(
        paths,
        { drawSVG: '0%' },
        {
          drawSVG: '100%',
          duration: 0.7,
          ease: 'power2.inOut',
          stagger: 0.12,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        },
      );
      }, el);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [reduced, idle]);

  return (
    <svg
      ref={ref}
      viewBox="0 0 120 84"
      width="120"
      height="84"
      role="img"
      aria-label={title}
      fill="none"
      stroke="var(--color-mark)"
      strokeWidth={1.25}
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2 82h116" />
      <path d="M10 82V34l24 14V34l24 14V34l24 14V82" />
      <path d="M10 34V10h9v24" />
      <path d="M70 82V62h14v20" />
      <rect x="96" y="60" width="12" height="10" />
      <rect x="22" y="62" width="10" height="8" />
      <rect x="40" y="62" width="10" height="8" />
    </svg>
  );
}
