import Link from 'next/link';

import { Plate } from '@/components/ui/Plate';
import type { Dictionary } from '@/content';
import { getPage, pagePath, type PageId } from '@/lib/pages';

/**
 * The band every inner page opens on: a full-bleed plate in the page's own
 * colour, carrying the page title and a breadcrumb.
 *
 * Two things it is fixing at once.
 *
 * The first is orientation. When the site was one continuous gradient, every
 * page began mid-surface with a section heading and nothing that said *which
 * page this is* — the visitor had to read the nav underline to find out. A
 * titled band is the oldest answer to that and still the right one.
 *
 * The second is where colour lives. The rule for this rebuild is white page,
 * colour on top, and the honest way to honour it is not to drain the site of
 * colour but to give colour an edge: this plate is 240px tall, it is the
 * strongest thing on the page, and it stops. Everything below it is white.
 *
 * The home page does not get one — it has a hero, and a hero preceded by a
 * title band is a page announcing itself twice.
 */
export function PageHeader({ page, dict }: { page: PageId; dict: Dictionary }) {
  const { plate } = getPage(page);
  const locale = dict.locale === 'en' ? 'en' : 'ru';
  const copy = dict.pages[page];

  return (
    <Plate tone={plate} as="div" className="relative">
      <div className="frame flex flex-col justify-end pt-14 pb-12 lg:pt-20 lg:pb-16">
        <nav aria-label={dict.breadcrumb.label}>
          <ol className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] font-bold tracking-[0.16em] uppercase">
            <li>
              <Link href={pagePath('home', locale)} className="text-white/60 transition-colors hover:text-white">
                {dict.pages.home.nav}
              </Link>
            </li>
            <li aria-hidden className="text-white/35">
              /
            </li>
            <li aria-current="page" className="text-white">
              {copy.nav}
            </li>
          </ol>
        </nav>

        <h1 className="mt-5 text-[clamp(2.25rem,5.2vw,4.25rem)] text-white">{copy.title}</h1>

        <p className="prose-lead mt-4 text-white/80">{copy.description}</p>
      </div>

      {/*
        A 6px rule welded to the plate's bottom edge, in the *other* brand
        colour. It is what makes the band read as laid on the white rather than
        as the top of the page: a hard colour-to-white transition with a second
        colour in the seam reads as a stacked object, which is the impression
        the whole system is after. Red on the indigo pages, indigo on the one
        page whose plate is already red — a red rule on red is not a seam.
      */}
      <span
        aria-hidden
        className={`absolute inset-x-0 bottom-0 h-1.5 ${plate === 'red' ? 'bg-indigo-900' : 'bg-red-500'}`}
      />
    </Plate>
  );
}
