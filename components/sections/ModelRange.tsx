'use client';

import { useEffect, useRef, useState } from 'react';

import { Section } from '@/components/layout/Section';
import { Img } from '@/components/ui/Img';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { Dictionary } from '@/content';
import { formatSpec, MODELS, type RadiatorModel } from '@/content/models';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useIsomorphicLayoutEffect, useIsDesktop, useReducedMotion } from '@/lib/hooks';

/**
 * 09 — Model range.
 *
 * On desktop the section pins and vertical scroll is converted into horizontal
 * travel across the range plus a true-scale size comparison. Everything
 * below the pin is authored as an ordinary snap-scrolling row, which is what
 * mobile and reduced-motion visitors get — no separate markup path.
 */

type Slug = keyof Dictionary['range']['taglines'];

function ModelCard({ model, dict }: { model: RadiatorModel; dict: Dictionary }) {
  const slug = model.slug as Slug;
  const locale = dict.locale === 'ru' ? 'ru' : 'en';

  return (
    <article
      data-model={model.slug}
      className="flex w-[min(86vw,25rem)] shrink-0 snap-center flex-col border border-line bg-white"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className="relative overflow-clip bg-paper px-6 pt-10">
        <Img
          id={model.image}
          alt={`${dict.range.imageAlt} ${model.name}`}
          sizes="(min-width: 768px) 25rem, 86vw"
          className="mx-auto h-56 w-auto object-contain object-bottom"
          data-model-image
        />
      </div>

      <div className="flex flex-1 flex-col p-7">
        <h3 className="text-2xl" data-model-name>
          {model.name}
        </h3>
        <p className="mt-3 text-sm text-slate">{dict.range.taglines[slug]}</p>

        <dl className="mt-7 flex flex-col border-t border-line">
          {model.specs.map((spec) => (
            <div
              key={spec.key}
              data-spec
              className="flex items-baseline justify-between gap-4 border-b border-line py-2.5"
            >
              <dt className="text-[0.8125rem] text-slate">{dict.range.specLabels[spec.key]}</dt>
              <dd className="tnum text-[0.9375rem] font-bold whitespace-nowrap text-ink">
                {formatSpec(spec, locale)}{' '}
                <span className="font-medium text-slate">{dict.range.units[spec.unit]}</span>
              </dd>
            </div>
          ))}
        </dl>

        <ul className="mt-6 flex flex-col gap-2">
          {dict.range.highlights[slug].map((h) => (
            <li key={h} className="flex items-start gap-2.5 text-[0.8125rem] text-slate">
              <svg
                viewBox="0 0 14 14"
                width="13"
                height="13"
                aria-hidden
                className="mt-1 shrink-0"
                fill="none"
                stroke="var(--color-indigo-700)"
                strokeWidth="1.8"
              >
                <path d="M2 7.5l3.4 3.4L12 3.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {h}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export function ModelRange({ dict }: { dict: Dictionary }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const desktop = useIsDesktop();
  const reduced = useReducedMotion();
  const [layoutKey, setLayoutKey] = useState(0);

  // The pin distance is baked into the timeline, so a resize has to rebuild the
  // whole context rather than just refresh it.
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(() => setLayoutKey((k) => k + 1), 200);
    };
    window.addEventListener('resize', onResize);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track || !desktop || reduced) return;

    const ctx = gsap.context(() => {
      // Must be a plain number, not a function. `containerAnimation` children
      // resolve their positions against this tween's end value at the moment
      // they are created; with a function-based value that end is still
      // unresolved, every child maps against zero, and cards settle at the
      // wrong angle as they pass the centre.
      const distance = Math.max(0, track.scrollWidth - window.innerWidth);
      if (distance === 0) return;

      const travel = gsap.to(track, {
        x: -distance,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: `+=${distance}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      });

      track.querySelectorAll<HTMLElement>('[data-model]').forEach((card) => {
        // One timeline per card, spanning the whole pass from entering on the
        // right to leaving on the left, so its midpoint is the card dead centre.
        //
        // Two separate tweens sharing `rotateY` and `scale` do not work here:
        // whichever was created last wins while both are live, and a plain `to`
        // captures its start value at creation rather than at handover, so the
        // card never actually settles at 0deg / 1.0 in the middle.
        //
        // `containerAnimation` is what lets these triggers measure against the
        // horizontal travel instead of the page scrollbar.
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            containerAnimation: travel,
            trigger: card,
            start: 'left right',
            end: 'right left',
            scrub: true,
          },
        });

        tl.fromTo(card, { scale: 0.9, rotateY: -18 }, { scale: 1, rotateY: 0, duration: 1 })
          .to(card, { scale: 0.9, rotateY: 18, duration: 1 })
          // Specs assemble while the card comes forward — on transform only.
          // Staggering opacity here left rows parked at partial alpha for a
          // third of the pass, which reads to a contrast checker as grey text
          // on white even though the resting colour is 8:1.
          .from(
            card.querySelectorAll('[data-spec]'),
            { y: 18, duration: 0.75, stagger: 0.08, ease: 'power2.out' },
            0.15,
          )
          // The name runs against its own card, so it reads as a separate plane.
          .fromTo(
            card.querySelectorAll('[data-model-name]'),
            { x: 44 },
            { x: -44, duration: 2 },
            0,
          );
      });
    }, section);

    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, [desktop, reduced, layoutKey]);

  return (
    <Section
      id="range"
      index={dict.range.index}
      tone="paper"
      labelledBy="range-title"
      clip={false}
    >
      <div ref={sectionRef} className="flex min-h-svh flex-col justify-center py-24">
        <div className="frame">
          <Reveal className="max-w-3xl">
            <SectionHeading id="range-title" kicker={dict.range.kicker} title={dict.range.title} />
            <p className="prose-lead mt-8" data-reveal>
              {dict.range.lead}
            </p>
            <p className="kicker mt-8 hidden lg:block" data-reveal>
              {dict.range.hint}
            </p>
          </Reveal>
        </div>

        <div
          ref={trackRef}
          className="mt-14 flex snap-x snap-mandatory items-stretch gap-6 overflow-x-auto pb-6 lg:overflow-visible"
          style={{ paddingInline: 'var(--frame-pad)', perspective: '1400px' }}
        >
          {MODELS.map((model) => (
            <ModelCard key={model.slug} model={model} dict={dict} />
          ))}

          {/* True-scale comparison: the same models as procedural geometry,
              standing on one floor so the height difference is real. */}
          <div className="flex w-[min(92vw,52rem)] shrink-0 snap-center flex-col border border-line bg-white p-7">
            <p className="kicker">{dict.range.scaleKicker}</p>
            <h3 className="mt-4 text-2xl">{dict.range.scaleTitle}</h3>
            <p className="mt-3 max-w-[42ch] text-sm text-slate">{dict.range.scaleNote}</p>

            <div data-gl-slot="lineup" className="relative mt-6 flex-1">
              <Img
                id="models/lineup"
                alt={dict.range.lineupAlt}
                sizes="(min-width: 768px) 52rem, 92vw"
                data-gl-fallback
                className="absolute inset-0 m-auto h-full w-full object-contain"
              />
            </div>

            {/* A grid, not `justify-between`: the names are uneven in length
                (ELEGANT PREMIUM against BRAVO) and equal columns are what keep
                each label under the model it belongs to. */}
            <ul
              className="mt-6 grid gap-2 border-t border-line pt-4"
              style={{ gridTemplateColumns: `repeat(${MODELS.length}, minmax(0, 1fr))` }}
            >
              {MODELS.map((m) => (
                <li key={m.slug} className="text-center">
                  <span className="block text-[0.6875rem] leading-tight font-bold tracking-[0.06em] text-ink uppercase">
                    {m.name}
                  </span>
                  <span className="tnum block text-[0.75rem] text-slate">
                    {m.section.height} {dict.range.units.mm}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Section>
  );
}
