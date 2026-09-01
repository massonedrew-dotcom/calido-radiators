import Link from 'next/link';

import { Section } from '@/components/layout/Section';
import { Reveal } from '@/components/ui/Reveal';
import type { Dictionary } from '@/content';
import { PAGES, pagePath } from '@/lib/pages';

/**
 * The home page's route into the rest of the site.
 *
 * Deliberately not three equal feature cards (skill §9.C). The grid is a 1+3
 * asymmetric bento: the first destination gets a tall cell with the product
 * still, the other three stack beside it as rules-separated rows. Cell count
 * equals destination count, so there is no empty tile to explain.
 */
export function Overview({ dict }: { dict: Dictionary }) {
  const locale = dict.locale === 'en' ? 'en' : 'ru';
  const destinations = PAGES.filter((p) => p.inNav && p.id !== 'contact');
  const [lead, ...rest] = destinations;

  return (
    <Section id="overview" labelledBy="overview-title">
      <div className="frame section-pad">
        <Reveal className="max-w-2xl">
          <h2 id="overview-title" className="display-sm">
            {dict.overview.title}
          </h2>
          <p className="prose-lead mt-5" data-reveal>
            {dict.overview.lead}
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-12">
          {lead ? (
            <Link
              href={pagePath(lead.id, locale)}
              className="on-dark group relative flex min-h-[18rem] flex-col justify-end overflow-clip bg-indigo-700 p-8 md:col-span-5 md:min-h-[26rem]"
            >
              {/*
                The lead cell is a plate, which is what makes this grid read as
                one large block of colour beside three white rows rather than as
                four cards of equal weight.

                It used to be a bordered white cell with a red-to-maroon radial
                gradient washed across it — a treatment that existed because the
                page behind it was a dark molten surface and the cell needed to
                be *darker* than that to register. On white the same gradient
                came out as a pale pink smear with no edge.

                Hover moves the plate one rung down the indigo ramp instead of
                scaling a background layer: a transform on a full-bleed gradient
                inside an `overflow-clip` box was repainting the whole cell.
              */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 bg-indigo-900 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{ transitionTimingFunction: 'var(--ease-out-expo)' }}
              />
              <span aria-hidden className="mb-6 block h-1.5 w-14 bg-red-500" />
              <h3 className="text-[clamp(1.5rem,2.6vw,2.25rem)] text-white">
                {dict.pages[lead.id].nav}
              </h3>
              <p className="mt-3 max-w-[30ch] text-sm text-white/75">{dict.pages[lead.id].card}</p>
            </Link>
          ) : null}

          <ul className="flex flex-col md:col-span-7">
            {rest.map((p) => (
              <li key={p.id} className="border-b border-hairline last:border-b-0">
                <Link
                  href={pagePath(p.id, locale)}
                  className="group flex items-baseline justify-between gap-6 py-7 transition-colors"
                >
                  <span className="flex flex-col gap-2">
                    <span className="text-[clamp(1.125rem,1.8vw,1.5rem)] font-extrabold tracking-[-0.02em] text-fg-strong uppercase transition-colors group-hover:text-accent">
                      {dict.pages[p.id].nav}
                    </span>
                    <span className="max-w-[38ch] text-sm text-fg">{dict.pages[p.id].card}</span>
                  </span>
                  <svg
                    viewBox="0 0 16 16"
                    width="18"
                    height="18"
                    aria-hidden
                    className="mt-1 shrink-0 text-fg-mute transition-transform duration-500 group-hover:translate-x-1 group-hover:text-accent"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    style={{ transitionTimingFunction: 'var(--ease-out-expo)' }}
                  >
                    <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
