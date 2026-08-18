'use client';

import { useState } from 'react';

import { Section } from '@/components/layout/Section';
import { Img } from '@/components/ui/Img';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { Dictionary } from '@/content';
import { COLORWAYS } from '@/content/models';

/**
 * 10 — Colour range.
 *
 * Every swatch swaps in a real photograph of that finish rather than tinting
 * one image, so nothing on screen is a colour the factory does not actually
 * produce. All five layers are stacked and cross-faded, which keeps the
 * transition on opacity alone.
 */
export function Colors({ dict }: { dict: Dictionary }) {
  const [active, setActive] = useState(COLORWAYS[0]!.slug);
  type Slug = keyof Dictionary['colors']['names'];

  return (
    <Section id="colors" index={dict.colors.index} tone="white" labelledBy="colors-title">
      <div className="frame py-28 md:py-40">
        <div className="grid-frame items-center gap-y-16">
          <Reveal className="col-span-4 md:col-span-6">
            <SectionHeading id="colors-title" kicker={dict.colors.kicker} title={dict.colors.title} />
            <p className="prose-lead mt-8" data-reveal>
              {dict.colors.lead}
            </p>
            <p className="mt-4 max-w-[46ch] text-sm text-slate" data-reveal>
              {dict.colors.note}
            </p>

            <fieldset className="mt-12" data-reveal>
              <legend className="kicker mb-5">{dict.colors.swatchLabel}</legend>
              <div className="flex flex-wrap gap-3">
                {COLORWAYS.map((c) => {
                  const selected = c.slug === active;
                  return (
                    <button
                      key={c.slug}
                      type="button"
                      onClick={() => setActive(c.slug)}
                      aria-pressed={selected}
                      className={[
                        'flex items-center gap-2.5 rounded-full border py-1.5 pr-4 pl-1.5 text-[0.8125rem] transition-colors duration-300',
                        selected
                          ? 'border-indigo-700 text-ink'
                          : 'border-line text-slate hover:border-indigo-500',
                      ].join(' ')}
                    >
                      <span
                        aria-hidden
                        className="size-6 rounded-full ring-1 ring-line ring-inset"
                        style={{ backgroundColor: c.hex }}
                      />
                      {dict.colors.names[c.slug as Slug]}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </Reveal>

          <div className="col-span-4 md:col-span-5 md:col-start-8">
            <div className="relative mx-auto aspect-[2/5] w-full max-w-72">
              {COLORWAYS.map((c) => (
                <Img
                  key={c.slug}
                  id={c.image}
                  alt={`${dict.colors.imageAlt} — ${dict.colors.names[c.slug as Slug]}`}
                  sizes="(min-width: 768px) 20vw, 60vw"
                  aria-hidden={c.slug !== active}
                  className={[
                    'absolute inset-0 m-auto h-full w-auto object-contain transition-opacity duration-600',
                    c.slug === active ? 'opacity-100' : 'opacity-0',
                  ].join(' ')}
                  style={{ transitionTimingFunction: 'var(--ease-out-expo)' }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
