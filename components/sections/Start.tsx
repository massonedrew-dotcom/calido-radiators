import Link from 'next/link';

import { Section } from '@/components/layout/Section';
import { Plate } from '@/components/ui/Plate';
import { Reveal } from '@/components/ui/Reveal';
import type { Dictionary } from '@/content';
import { pagePath } from '@/lib/pages';

/**
 * Closing CTA on the home page, as the page's last plate.
 *
 * It was a hairline rule with a heading and a pill button on the page
 * background — which worked when that background was a deep indigo with the red
 * accent coming back under it, and does nothing at all on white. The band is
 * now the object: full-bleed indigo, the red button on top of it, and it is the
 * only thing between the last section and the footer.
 *
 * One CTA, one intent. The label is the same string the header and the floating
 * button use, because two different words for "contact us" on one page is a
 * duplicate intent.
 */
export function Start({ dict }: { dict: Dictionary }) {
  const locale = dict.locale === 'en' ? 'en' : 'ru';

  return (
    <Section id="start" labelledBy="start-title" plated>
      <Plate tone="indigo">
        <div className="frame py-16 lg:py-20">
          <Reveal className="flex flex-col items-start gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 id="start-title" className="display-sm max-w-[16ch] text-white">
                {dict.start.title}
              </h2>
              <p className="prose-lead mt-5 text-white/80" data-reveal>
                {dict.start.lead}
              </p>
            </div>

            <Link
              href={pagePath('contact', locale)}
              className="inline-flex shrink-0 items-center gap-3 bg-red-500 px-8 py-4 text-[0.75rem] font-bold tracking-[0.1em] text-white uppercase transition-colors hover:bg-red-700"
            >
              {dict.nav.cta}
              <svg
                viewBox="0 0 16 16"
                width="14"
                height="14"
                aria-hidden
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </Reveal>
        </div>
      </Plate>
    </Section>
  );
}
