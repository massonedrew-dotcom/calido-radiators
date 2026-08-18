'use client';

import { useRef } from 'react';

import { Section } from '@/components/layout/Section';
import { ArcField } from '@/components/ui/ArcField';
import { Img } from '@/components/ui/Img';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { Dictionary } from '@/content';
import { gsap } from '@/lib/gsap';
import { useIsomorphicLayoutEffect, useReducedMotion } from '@/lib/hooks';

/**
 * 13 — Warranty.
 *
 * The z-index play from the source slide: an oversized "10" in ink, the word
 * "years" in indigo riding over it, and the radiator rising from below to cut
 * across the digit. The three layers move at different rates on one scrub, so
 * the overlap resolves as you scroll rather than being a static composition.
 */
export function Warranty({ dict }: { dict: Dictionary }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: el, start: 'top 85%', end: 'bottom bottom', scrub: true },
      });

      tl.fromTo('[data-warranty-number]', { yPercent: 14 }, { yPercent: -4 }, 0)
        .fromTo('[data-warranty-word]', { yPercent: 60, xPercent: -8 }, { yPercent: 0, xPercent: 0 }, 0)
        .fromTo('[data-warranty-image]', { yPercent: 42 }, { yPercent: 0 }, 0);
    }, el);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <Section id="warranty" index={dict.warranty.index} tone="paper" labelledBy="warranty-title">
      <ArcField variant="left" />

      <div className="frame pt-28 md:pt-40">
        <Reveal className="max-w-2xl">
          <SectionHeading
            id="warranty-title"
            kicker={dict.warranty.kicker}
            title={dict.warranty.title}
          />
          <p className="prose-lead mt-8" data-reveal>
            {dict.warranty.lead}
          </p>
          <p className="prose-lead mt-2" data-reveal>
            {dict.warranty.sub}
          </p>
        </Reveal>
      </div>

      <div
        ref={ref}
        className="frame relative mt-8 flex min-h-[60vh] items-end overflow-clip md:min-h-[76vh]"
      >
        <p
          aria-hidden
          className="tnum relative z-0 -mb-[0.08em] text-[clamp(9rem,34vw,26rem)] leading-[0.72] font-extrabold text-ink"
          data-warranty-number
        >
          {dict.warranty.number}
        </p>

        <span
          aria-hidden
          className="absolute top-[8%] left-[38%] z-20 text-[clamp(2rem,7vw,5.5rem)] leading-none font-extrabold tracking-[-0.02em] text-indigo-700 uppercase"
          data-warranty-word
        >
          {dict.warranty.years}
        </span>

        <Img
          id="sections/warranty-mustard"
          alt={dict.warranty.imageAlt}
          sizes="(min-width: 768px) 42vw, 70vw"
          className="absolute right-0 bottom-0 z-10 h-auto w-[58%] max-w-2xl md:w-[46%]"
          data-warranty-image
        />

        <span className="sr-only">
          {dict.warranty.number} {dict.warranty.years}
        </span>
      </div>
    </Section>
  );
}
