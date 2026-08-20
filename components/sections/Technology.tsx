'use client';

import { useRef, useState } from 'react';

import { CastingDiagram, type CastingDiagramHandle } from '@/components/sections/CastingDiagram';
import { Section } from '@/components/layout/Section';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { Dictionary } from '@/content';
import { SCRUB, gsap, ScrollTrigger } from '@/lib/gsap';
import { useIsomorphicLayoutEffect, useIsDesktop, useReducedMotion } from '@/lib/hooks';

/**
 * High-pressure die casting, as one continuous transformation.
 *
 * The three stages are not three pictures. A single scrubbed progress value
 * drives the whole thing: the die stands closed, metal rises through it under
 * pressure at full heat, then the halves draw apart and the casting cools from
 * ember through brand red to finished alloy. Every frame is a blend of two
 * stages - the exact windows live in CastingDiagram.
 *
 * The visual used to be a WebGL scene and is now a technical cross-section. Two
 * reasons. Procedural geometry lit by a hand-written shader was losing badly to
 * the studio product renders elsewhere on the site, and the mould specifically
 * read as two grey slabs. And a cutaway can show what a camera cannot: metal
 * inside a closed steel die. The drawing is in the same idiom as the connection
 * diagrams on the installation page, so the two technical sections now match.
 *
 * Three drivers, because a pin is a desktop affordance:
 *   - desktop: the section pins for 170vh and the scroll scrubs the diagram;
 *   - narrow: no pin, the diagram scrubs as the section passes the viewport;
 *   - reduced motion: one static frame, the opened mould with the casting in it.
 */
export function Technology({ dict }: { dict: Dictionary }) {
  const pinRef = useRef<HTMLDivElement>(null);
  const diagramRef = useRef<CastingDiagramHandle>(null);
  const desktop = useIsDesktop();
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);

  useIsomorphicLayoutEffect(() => {
    const pin = pinRef.current;
    const diagram = diagramRef.current;
    // `useIsDesktop` is null until the media query has been evaluated. Building
    // a trigger against null would pick the narrow branch and then immediately
    // tear it down, which on the desktop path means creating and reverting a
    // pin - the one ScrollTrigger operation expensive enough to be visible.
    if (!pin || !diagram || desktop === null) return;

    // The most informative single frame: mould open, casting finished and cool.
    if (reduced) {
      diagram.set(0.85);
      setActive(2);
      return;
    }

    const onUpdate = (progress: number) => {
      diagram.set(progress);
      // Boundaries sit at the midpoint of each blend window in the diagram, so
      // the copy changes over while the visual is halfway between stages rather
      // than before or after it.
      const next = progress < 0.3 ? 0 : progress < 0.68 ? 1 : 2;
      setActive((prev) => (prev === next ? prev : next));
    };

    const ctx = gsap.context(() => {
      ScrollTrigger.create(
        desktop
          ? {
              trigger: pin,
              start: 'top top',
              end: '+=170%',
              pin: true,
              // `scrub: true` on a pin reproduces every jitter in the wheel
              // delta, which on a 170vh pin is a long time to be jittering.
              scrub: SCRUB,
              anticipatePin: 1,
              onUpdate: (self) => onUpdate(self.progress),
            }
          : {
              // No pin below the breakpoint: pinning on a phone fights the
              // browser own scroll and costs more than the effect is worth.
              // The diagram plays through as the section crosses the viewport.
              trigger: pin,
              start: 'top 78%',
              end: 'bottom 45%',
              scrub: SCRUB,
              onUpdate: (self) => onUpdate(self.progress),
            },
      );
    }, pin);

    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, [desktop, reduced]);

  return (
    <Section id="technology" labelledBy="technology-title" clip={false}>
      {/*
        A five-column text well, not six.

        A pinned section is the one place on the page where content taller than
        the viewport is not merely ugly - it is unreachable, because the pin
        holds it still while the scroll it would need is being spent on the
        timeline. Everything here is sized so the whole block clears 100svh at
        the shortest viewport the design targets.

        Which is also why the bar clearance is `pt-24 pb-6` rather than the
        `py-16` this used to carry, and not the global first-section rule the
        other five pages get. `items-center` centres inside the content box, so
        a 96px top padding is a floor the copy can never rise above - it clears
        the 88px bar at every viewport height, where plain centring did not: at
        1280x800 the kicker settled at 81px, under the bar. And the total here
        is 120px against the old 128px, so the block gets *shorter*. Adding
        clearance on top instead would have grown a pinned panel, which is the
        one thing this section cannot afford.
      */}
      <div ref={pinRef} className="frame flex min-h-svh items-center pt-24 pb-6">
        <div className="grid-frame w-full items-center gap-y-10">
          <Reveal className="col-span-4 md:col-span-5">
            <SectionHeading
              id="technology-title"
              kicker={dict.technology.kicker}
              title={dict.technology.title}
              tone="red"
            />
            <p className="prose-lead mt-6" data-reveal>
              {dict.technology.lead}
            </p>
            {/* Moved here from the connection section, where a paragraph about
                the alloy and the casting method had nothing to do with pipe
                layouts. This is the section it describes. */}
            <p className="mt-3 max-w-[52ch] text-sm leading-relaxed text-fg" data-reveal>
              {dict.connection.body}
            </p>

            <ol className="mt-10 flex flex-col border-y border-hairline">
              {dict.technology.stages.map((stage, i) => {
                const on = i === active;
                return (
                  <li
                    key={stage.id}
                    data-stage={stage.id}
                    aria-current={on ? 'step' : undefined}
                    className="relative flex gap-5 border-b border-hairline py-4 last:border-b-0"
                  >
                    {/* The active marker slides as a scaled bar rather than
                        swapping a background, so the step change reads as one
                        movement instead of a cut. */}
                    <span
                      aria-hidden
                      className="absolute top-0 bottom-0 -left-4 w-0.5 origin-center bg-red-500 transition-transform duration-500"
                      style={{
                        transform: `scaleY(${on ? 1 : 0})`,
                        transitionTimingFunction: 'var(--ease-out-expo)',
                      }}
                    />
                    <span
                      className={[
                        'tnum kicker w-7 shrink-0 pt-1 transition-colors duration-500',
                        on ? 'text-accent' : 'text-fg-mute',
                      ].join(' ')}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      className="transition-[opacity,transform] duration-500"
                      style={{
                        // 0.7, not 0.42. The inactive steps are still text a
                        // visitor reads - the audit measured them at 4.0:1 and
                        // 3.0:1 once the ancestor opacity was folded in, both
                        // under AA. The active step is distinguished by the red
                        // marker bar and the accent numeral, which do not cost
                        // legibility to carry.
                        opacity: on ? 1 : 0.7,
                        transform: on ? 'translateY(0)' : 'translateY(8px)',
                        transitionTimingFunction: 'var(--ease-out-expo)',
                      }}
                    >
                      <span className="block text-sm font-bold tracking-[0.08em] text-white uppercase">
                        {stage.label}
                      </span>
                      <span className="mt-1 block text-sm text-fg">{stage.text}</span>
                    </span>
                  </li>
                );
              })}
            </ol>
          </Reveal>

          {/* Seven of twelve columns - about 49% of the viewport at 1440, up
              from the 40% the audit measured and asked to grow. */}
          <div className="col-span-4 flex h-[46svh] items-center justify-center md:col-span-7 md:h-[64svh]">
            <CastingDiagram ref={diagramRef} title={dict.technology.imageAlt} />
          </div>
        </div>
      </div>
    </Section>
  );
}
