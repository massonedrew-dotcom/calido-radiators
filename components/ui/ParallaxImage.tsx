'use client';

import { useRef } from 'react';

import { Img } from '@/components/ui/Img';
import type { AssetId } from '@/content/assets.generated';
import { gsap } from '@/lib/gsap';
import {
  useIdle,
  useIsDesktop,
  useIsomorphicLayoutEffect,
  useReducedMotion,
} from '@/lib/hooks';

/**
 * Scrubbed parallax for photography only.
 *
 * Text never gets this treatment — copy stays locked to the grid so a line can
 * never drift out of its column while it is being read.
 */
export function ParallaxImage({
  id,
  alt,
  sizes,
  className = '',
  wrapperClassName = '',
  from = 15,
  to = -15,
  rotate,
  priority,
}: {
  id: AssetId;
  alt: string;
  sizes: string;
  className?: string;
  wrapperClassName?: string;
  /** Travel in percent of the image's own height. */
  from?: number;
  to?: number;
  /** Optional degrees of rotation across the same range. */
  rotate?: [number, number];
  priority?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const idle = useIdle();
  const desktop = useIsDesktop();

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    // A scrubbed parallax buys little on a narrow screen and costs a transform
    // write per frame, so mobile keeps the image still.
    if (!el || reduced || !idle || !desktop) return;
    const target = el.firstElementChild;
    if (!target) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        target,
        { yPercent: from, rotate: rotate?.[0] ?? 0 },
        {
          yPercent: to,
          rotate: rotate?.[1] ?? 0,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [reduced, idle, desktop, from, to, rotate]);

  return (
    <div ref={ref} className={`overflow-clip ${wrapperClassName}`}>
      <Img id={id} alt={alt} sizes={sizes} priority={priority} className={className} />
    </div>
  );
}
