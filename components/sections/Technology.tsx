'use client';

import { useRef, useState } from 'react';

import { Section } from '@/components/layout/Section';
import { ArcField } from '@/components/ui/ArcField';
import { Img } from '@/components/ui/Img';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { Dictionary } from '@/content';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useIsomorphicLayoutEffect, useIsDesktop, useReducedMotion } from '@/lib/hooks';

/**
 * 04 — High-pressure die casting.
 *
 * Pinned for an extra 150vh while three stages play out: empty die, metal
 * rising under pressure, finished section. The 3D in the shared Stage is the
 * subject; the copy switches in step with it.
 *
 * Because pinning freezes the slot's bounding rect, this section publishes its
 * own ScrollTrigger progress onto the slot element — the Stage prefers that
 * over the rect it would otherwise measure.
 */
export function Technology({ dict }: { dict: Dictionary }) {
  const pinRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const desktop = useIsDesktop();
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);

  useIsomorphicLayoutEffect(() => {
    const pin = pinRef.current;
    const slot = slotRef.current;
    if (!pin || !slot || !desktop || reduced) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: pin,
        start: 'top top',
        end: '+=150%',
        pin: true,
        scrub: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          slot.dataset.glProgress = String(self.progress);
          // Boundaries match the pour window in the Stage's `cast` scene.
          const next = self.progress < 0.24 ? 0 : self.progress < 0.62 ? 1 : 2;
          setActive((prev) => (prev === next ? prev : next));
        },
      });
    }, pin);

    return () => {
      ctx.revert();
      delete slot.dataset.glProgress;
      ScrollTrigger.refresh();
    };
  }, [desktop, reduced]);

  return (
    <Section
      id="technology"
      index={dict.technology.index}
      tone="dark"
      labelledBy="technology-title"
      clip={false}
    >
      <ArcField variant="left" dark />

      <div ref={pinRef} className="frame flex min-h-svh items-center py-24">
        <div className="grid-frame w-full items-center gap-y-16">
          <Reveal className="col-span-4 md:col-span-6">
            <SectionHeading
              id="technology-title"
              kicker={dict.technology.kicker}
              title={dict.technology.title}
              tone="red"
            />
            <p className="prose-lead mt-8" data-reveal>
              {dict.technology.lead}
            </p>

            <ol className="mt-14 flex flex-col border-y border-line-dark">
              {dict.technology.stages.map((stage, i) => {
                const on = i === active;
                return (
                  <li
                    key={stage.id}
                    data-stage={stage.id}
                    aria-current={on ? 'step' : undefined}
                    className="flex gap-6 border-b border-line-dark py-5 last:border-b-0"
                  >
                    <span
                      className={[
                        'tnum kicker w-8 shrink-0 pt-1 transition-colors duration-500',
                        on ? 'text-red-600' : 'text-indigo-100/35',
                      ].join(' ')}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      className="transition-[opacity,transform] duration-500"
                      style={{
                        opacity: on ? 1 : 0.32,
                        transform: on ? 'translateY(0)' : 'translateY(20px)',
                        transitionTimingFunction: 'var(--ease-out-expo)',
                      }}
                    >
                      <span className="block text-sm font-bold tracking-[0.08em] text-white uppercase">
                        {stage.label}
                      </span>
                      <span className="mt-1 block text-sm text-indigo-100/80">{stage.text}</span>
                    </span>
                  </li>
                );
              })}
            </ol>
          </Reveal>

          <div
            ref={slotRef}
            data-gl-slot="cast"
            className="col-span-4 flex h-[62vh] items-center justify-center md:col-span-6"
          >
            <Img
              id="sections/tech-indigo"
              alt={dict.technology.imageAlt}
              sizes="(min-width: 768px) 46vw, 100vw"
              data-gl-fallback
              className="h-full w-auto object-contain"
            />
          </div>
        </div>
      </div>
    </Section>
  );
}
