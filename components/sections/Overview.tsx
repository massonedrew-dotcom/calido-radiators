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
              className="group relative flex min-h-[18rem] flex-col justify-end overflow-clip border border-hairline p-8 transition-colors hover:border-accent md:col-span-5 md:min-h-[26rem]"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 opacity-70 transition-transform duration-700 group-hover:scale-[1.04]"
                style={{
                  background:
                    'radial-gradient(120% 90% at 70% 10%, rgba(217, 18, 34, 0.32) 0%, rgba(78, 8, 15, 0.35) 45%, transparent 78%)',
                  transitionTimingFunction: 'var(--ease-out-expo)',
                }}
              />
              <h3 className="text-[clamp(1.5rem,2.6vw,2.25rem)]">{dict.pages[lead.id].nav}</h3>
              <p className="mt-3 max-w-[30ch] text-sm text-fg">{dict.pages[lead.id].card}</p>
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
