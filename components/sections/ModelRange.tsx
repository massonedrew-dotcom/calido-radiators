'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { Section } from '@/components/layout/Section';
import { Img } from '@/components/ui/Img';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { Dictionary } from '@/content';
import { formatSpec, MODELS, type RadiatorModel } from '@/content/models';
import { gsap } from '@/lib/gsap';
import { useIsomorphicLayoutEffect, useReducedMotion } from '@/lib/hooks';

/**
 * The range, as a focus slider.
 *
 * The first build converted vertical scroll into a pinned horizontal track. It
 * failed in four separate ways at once: the cards were taller than the viewport
 * so their advantages and CTA were cut off the bottom, neighbouring cards sat
 * half-clipped at both edges, there was no indication of which of six you were
 * looking at, and the content only assembled once you had already scrolled past
 * it.
 *
 * A slider fixes all four by construction. Exactly one card is presented at a
 * time and it is sized to fit; the neighbours are visible but reduced and
 * dimmed, so they read as "there is more" rather than as clipped content; the
 * position is stated as 01 / 06; and nothing is scroll-gated, so the card is
 * complete the moment the section is on screen.
 *
 * Driving is by button, arrow key, or swipe, and the transition is a single
 * timeline on transform and opacity.
 */

type Slug = keyof Dictionary['range']['taglines'];

/** Swipe distance in px before a drag counts as a change of card. */
const SWIPE = 56;

function Card({
  model,
  dict,
  state,
  active,
}: {
  model: RadiatorModel;
  dict: Dictionary;
  /** Where this card sits relative to the active one. */
  state: 'prev' | 'current' | 'next' | 'far';
  active: boolean;
}) {
  const slug = model.slug as Slug;
  const locale = dict.locale === 'ru' ? 'ru' : 'en';

  const offset = state === 'prev' ? -1 : state === 'next' ? 1 : 0;
  const visible = state !== 'far';

  return (
    <article
      data-model={model.slug}
      aria-hidden={!active}
      inert={!active ? true : undefined}
      className="absolute inset-0 flex flex-col border border-hairline bg-surface-card backdrop-blur-sm"
      style={{
        // 92%, so a neighbour shows as a hand's-width sliver at the frame edge
        // rather than as half a card. Half a card is what the old horizontal
        // track produced, and it reads as a rendering fault rather than as an
        // affordance. The scale and opacity are the brief's.
        transform: `translate3d(${offset * 96}%, 0, 0) scale(${active ? 1 : 0.88})`,
        // A neighbour is an edge, not a preview. At 0.4 opacity its spec table
        // was still legible through the blur at the frame edge and read as a
        // second card leaking in; 0.18 leaves a shape and nothing to read.
        opacity: !visible ? 0 : active ? 1 : 0.18,
        filter: active ? 'none' : 'blur(4px)',
        pointerEvents: active ? 'auto' : 'none',
        zIndex: active ? 2 : 1,
        transition:
          'transform 620ms var(--ease-out-expo), opacity 480ms var(--ease-out-expo)',
        willChange: 'transform, opacity',
      }}
    >
      <div className="grid flex-1 grid-cols-1 sm:grid-cols-[42%_1fr]">
        {/*
            A full-bleed detail panel, not a floating cutout.

            Two earlier versions were wrong. The first put a WebGL mesh over the
            card and hid the photograph underneath; the overlay measured zero
            pixels tall, so the card showed an empty well. The second showed the
            photograph `object-contain` with a feathered edge - but every one of
            the six model renders is an aggressive diagonal macro that runs off
            its own frame, so contained and floating it read as a broken product
            shot rather than a product.

            Bled to the card edge and cropped deliberately, the same asset reads
            as an art-directed detail, which is what it actually is. The whole
            product is not lost: the spec table beside it carries the
            dimensions, and the scale section below compares all six.
          */}
        <div className="relative min-h-[12rem] overflow-hidden sm:min-h-0">
          <Img
            id={model.image}
            alt={`${dict.range.imageAlt} ${model.name}`}
            sizes="(min-width: 640px) 30vw, 100vw"
            data-card-image
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          {/* Ties the panel into the card instead of butting one flat rectangle
              against another. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, transparent 55%, var(--color-surface-card) 100%)',
            }}
          />
        </div>

        <div className="flex flex-col p-6 sm:p-7">
          <h3 className="text-[clamp(1.25rem,2vw,1.75rem)]">{model.name}</h3>
          <p className="mt-2 text-sm text-fg">{dict.range.taglines[slug]}</p>

          <dl className="mt-5 flex flex-col border-t border-hairline">
            {model.specs.map((spec) => (
              <div
                key={spec.key}
                className="flex items-baseline justify-between gap-4 border-b border-hairline py-1.5"
              >
                <dt className="text-[0.75rem] text-fg">{dict.range.specLabels[spec.key]}</dt>
                <dd className="tnum text-[0.8125rem] font-bold whitespace-nowrap text-fg-strong">
                  {formatSpec(spec, locale)}{' '}
                  <span className="font-medium text-fg">{dict.range.units[spec.unit]}</span>
                </dd>
              </div>
            ))}
          </dl>

          {/* A compact row of marks rather than a stacked list: three bullet
              paragraphs was most of the height that pushed the CTA off screen. */}
          <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
            {dict.range.highlights[slug].map((h) => (
              <li key={h} className="flex items-start gap-2 text-[0.75rem] leading-snug text-fg">
                <svg
                  viewBox="0 0 14 14"
                  width="12"
                  height="12"
                  aria-hidden
                  className="mt-0.5 shrink-0"
                  fill="none"
                  stroke="var(--color-red-500)"
                  strokeWidth="2"
                >
                  <path d="M2 7.5l3.4 3.4L12 3.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {h}
              </li>
            ))}
          </ul>

          <a
            href="#contact"
            className="mt-auto inline-flex w-fit items-center gap-2 self-start rounded-full bg-red-500 px-6 py-3 text-[0.6875rem] font-bold tracking-[0.1em] text-white uppercase transition-colors hover:bg-red-700"
          >
            {dict.nav.cta}
          </a>
        </div>
      </div>
    </article>
  );
}

export function ModelRange({ dict }: { dict: Dictionary }) {
  const [index, setIndex] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<number | null>(null);
  const reduced = useReducedMotion();

  const total = MODELS.length;
  const go = useCallback(
    (delta: number) => setIndex((i) => (i + delta + total) % total),
    [total],
  );

  // Arrow keys work whenever the slider itself holds focus, which is what makes
  // it operable without a pointer.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(-1);
    }
  };

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const down = (e: PointerEvent) => {
      dragStart.current = e.clientX;
    };
    const up = (e: PointerEvent) => {
      const from = dragStart.current;
      dragStart.current = null;
      if (from === null) return;
      const dx = e.clientX - from;
      if (Math.abs(dx) > SWIPE) go(dx < 0 ? 1 : -1);
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', () => (dragStart.current = null));
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointerup', up);
    };
  }, [go]);

  // The progress bar is the only thing here that animates on a tween; the cards
  // themselves ride CSS transitions, which cost nothing when idle.
  const barRef = useRef<HTMLDivElement>(null);
  useIsomorphicLayoutEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const to = (index + 1) / total;
    if (reduced) {
      gsap.set(bar, { scaleX: to });
      return;
    }
    gsap.to(bar, { scaleX: to, duration: 0.62, ease: 'power3.inOut', overwrite: true });
  }, [index, total, reduced]);

  const relation = (i: number): 'prev' | 'current' | 'next' | 'far' => {
    if (i === index) return 'current';
    if (i === (index - 1 + total) % total) return 'prev';
    if (i === (index + 1) % total) return 'next';
    return 'far';
  };

  return (
    <Section id="range" labelledBy="range-title">
      <div className="frame section-pad">
        <Reveal className="max-w-3xl">
          <SectionHeading id="range-title" kicker={dict.range.kicker} title={dict.range.title} />
          <p className="prose-lead mt-5" data-reveal>
            {dict.range.lead}
          </p>
        </Reveal>

        <div
          className="mt-8"
          role="group"
          aria-roledescription="carousel"
          aria-label={dict.range.title}
          tabIndex={0}
          onKeyDown={onKeyDown}
        >
          <div className="mb-5 flex items-center justify-between gap-6">
            <p className="tnum flex items-baseline gap-2 text-fg-strong">
              <span className="kicker text-fg">{dict.range.counterLabel}</span>
              <span className="text-lg font-extrabold">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="text-sm text-fg">/ {String(total).padStart(2, '0')}</span>
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label={dict.range.prev}
                className="grid size-10 place-items-center rounded-full border border-hairline text-fg-strong transition-colors hover:border-red-500 hover:text-accent"
              >
                <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M10 2L4 8l6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label={dict.range.next}
                className="grid size-10 place-items-center rounded-full border border-hairline text-fg-strong transition-colors hover:border-red-500 hover:text-accent"
              >
                <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M6 2l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          <div className="mb-6 h-px w-full bg-hairline">
            <div ref={barRef} className="h-px origin-left scale-x-0 bg-red-500" />
          </div>

          {/*
            A fixed-height stage rather than a content-height one.

            The card is absolutely positioned inside it, so its height is the
            stage's height and cannot grow past the viewport no matter how long
            a tagline or a spec label runs in translation. This is the property
            the old track did not have, and losing it is what cut the CTA off.
          */}
          <div
            ref={stageRef}
            className="relative h-[clamp(26rem,48svh,30rem)] touch-pan-y select-none"
          >
            {MODELS.map((model, i) => (
              <Card
                key={model.slug}
                model={model}
                dict={dict}
                state={relation(i)}
                active={i === index}
              />
            ))}

          </div>

          <ul className="mt-6 flex flex-wrap justify-center gap-2">
            {MODELS.map((model, i) => (
              <li key={model.slug}>
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={model.name}
                  aria-current={i === index ? 'true' : undefined}
                  className={[
                    'rounded-full border px-4 py-1.5 text-[0.6875rem] font-bold tracking-[0.08em] uppercase transition-colors',
                    i === index
                      ? 'border-red-500 text-accent'
                      : 'border-hairline text-fg hover:border-indigo-500',
                  ].join(' ')}
                >
                  {model.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
