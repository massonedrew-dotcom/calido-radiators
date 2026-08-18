'use client';

import { useRef } from 'react';

import { gsap } from '@/lib/gsap';
import { useIdle, useIsomorphicLayoutEffect, useReducedMotion } from '@/lib/hooks';

/**
 * The hairline circle arcs with node dots carried over from the source stories.
 * Purely decorative, so it is aria-hidden and never receives pointer events.
 *
 * Parallax lives here rather than on the text: copy stays fixed to the grid,
 * only the background graphic drifts.
 */

type Variant = 'right' | 'left' | 'both';

const NODE_R = 5;

function Arc({
  cx,
  cy,
  r,
  node,
  dark,
}: {
  cx: number;
  cy: number;
  r: number;
  node?: [number, number];
  dark?: boolean;
}) {
  const stroke = dark ? 'var(--color-line-dark)' : 'var(--color-line)';
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={stroke} strokeWidth={1} />
      {node ? (
        <circle
          cx={node[0]}
          cy={node[1]}
          r={NODE_R}
          fill="var(--color-white)"
          stroke={stroke}
          strokeWidth={1}
        />
      ) : null}
    </g>
  );
}

export function ArcField({
  variant = 'right',
  dark = false,
  amount = 9,
}: {
  variant?: Variant;
  dark?: boolean;
  /** Parallax travel in percent of the field's own height. */
  amount?: number;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const reduced = useReducedMotion();
  const idle = useIdle();

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    // Purely decorative drift — nothing is lost by arming it after hydration.
    if (!el || reduced || !idle) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { yPercent: amount },
        {
          yPercent: -amount,
          ease: 'none',
          scrollTrigger: {
            trigger: el.parentElement ?? el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      );
    }, el);

    // No global refresh on teardown: with eight of these on the page that would
    // re-measure every trigger eight times over on a route change.
    return () => ctx.revert();
  }, [reduced, idle, amount]);

  return (
    <svg
      ref={ref}
      aria-hidden
      focusable="false"
      viewBox="0 0 1440 1000"
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none absolute inset-0 -z-10 h-full w-full"
    >
      {(variant === 'right' || variant === 'both') && (
        <>
          <Arc cx={1430} cy={210} r={430} node={[1216, -80]} dark={dark} />
          <Arc cx={1330} cy={760} r={300} node={[1120, 970]} dark={dark} />
        </>
      )}
      {(variant === 'left' || variant === 'both') && (
        <>
          <Arc cx={10} cy={820} r={380} node={[190, 1155]} dark={dark} />
          <Arc cx={-60} cy={240} r={260} node={[110, 460]} dark={dark} />
        </>
      )}
    </svg>
  );
}
