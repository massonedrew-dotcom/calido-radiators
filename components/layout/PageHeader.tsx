import Link from 'next/link';

import { abs } from '@/app/_shared/JsonLd';
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

  /**
   * The visible trail, again, for a crawler.
   *
   * Emitted here rather than alongside the rest of the graph in JsonLd, and
   * that is the point: `BreadcrumbList` has to describe the breadcrumbs that
   * are actually on the page, and the only way to guarantee that is to build
   * both from the same two values in the same component. Put it on the home
   * page and it would be describing a trail that does not exist there — which
   * is why JsonLd, which only renders on the home page, is the wrong home for
   * it.
   */
  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { name: dict.pages.home.nav, item: abs(pagePath('home', locale)) },
      { name: copy.nav, item: abs(pagePath(page, locale)) },
    ].map((entry, i) => ({ '@type': 'ListItem', position: i + 1, ...entry })),
  };

  return (
    <Plate tone={plate} as="div" className="relative">
      <script
        type="application/ld+json"
        // Static, locally-built payload; no user input reaches this string.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbs).replace(/</g, '\\u003c'),
        }}
      />

      <div className="frame flex flex-col justify-end pt-14 pb-12 lg:pt-20 lg:pb-16">
        <nav aria-label={dict.breadcrumb.label}>
          <ol className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] font-bold tracking-[0.16em] uppercase">
            {/*
              Near-white rather than the 60% these carried before. At 11px and
              0.16em tracking, uppercase breadcrumbs are already the smallest
              type on the band; taking a third of the contrast out of them on
              top of that was what made them read as a stain on the plate
              rather than as a control. The current page stays pure white, so
              the pair still separates "where you can go" from "where you are".
            */}
            <li>
              <Link href={pagePath('home', locale)} className="text-white/85 transition-colors hover:text-white">
                {dict.pages.home.nav}
              </Link>
            </li>
            <li aria-hidden className="text-white/45">
              /
            </li>
            <li aria-current="page" className="text-white">
              {copy.nav}
            </li>
          </ol>
        </nav>

        <h1 className="mt-5 text-[clamp(2.25rem,5.2vw,4.25rem)] text-white">{copy.title}</h1>

        {/*
          One step up from `prose-lead`'s own clamp, overridden here rather than
          in the utility: `prose-lead` is body copy in a dozen sections and this
          is the only place it has a 68px heading directly above it, where the
          default size read as a caption instead of a standfirst. Kept well
          under the h1 so the hierarchy is unchanged - roughly a third of it at
          every viewport. The `max-width: 52ch` from `prose-lead` still applies.
        */}
        <p className="prose-lead mt-4 text-[clamp(1.09375rem,1.35vw,1.3125rem)] leading-[1.6] text-white/90">
          {copy.description}
        </p>
      </div>

      {/*
        A 6px rule welded to the plate's bottom edge, in the *other* brand
        colour. It is what makes the band read as laid on the white rather than
        as the top of the page: a hard colour-to-white transition with a second
        colour in the seam reads as a stacked object, which is the impression
        the whole system is after.

        The rule is always the colour the plate is not, because a seam in the
        plate's own colour is not a seam. No page takes the red plate any more
        (see `plate` in lib/pages.ts), so in practice this is red on indigo
        everywhere; the branch stays because the invariant is "not the plate
        colour", not "always red".
      */}
      <span
        aria-hidden
        className={`absolute inset-x-0 bottom-0 h-1.5 ${plate === 'red' ? 'bg-indigo-900' : 'bg-red-500'}`}
      />
    </Plate>
  );
}
