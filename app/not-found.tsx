import Link from 'next/link';

import { Plate } from '@/components/ui/Plate';
import { ru } from '@/content/ru';
import { PAGES, pagePath } from '@/lib/pages';

/**
 * 404, in the site's own design.
 *
 * What was here before is what Next ships when you do not write this file: a
 * bare white page reading "404: This page could not be found." with no header,
 * no footer, no styling and no way out except the back button. A wrong URL is
 * not a rare event — it is what an expired link from a search result, a
 * mistyped address and a stale bookmark all land on — and answering it with a
 * dead end throws away a visitor the site has already earned.
 *
 * Russian only, deliberately. This route is outside both locale groups (that
 * is what makes it the catch-all), so it has no locale to read and no honest
 * way to guess one — a request for `/en/typo` and a request for `/typo` arrive
 * here identically. Russian is the primary market, and the nav below is the
 * way to an English page in two clicks rather than none.
 *
 * The full page shell is not used, for the same reason: `PageShell` takes a
 * `PageId` and a dictionary and hangs scroll-linked chrome off both, and there
 * is no page id for "none of them". The header and footer are replaced by the
 * one thing this page actually owes the visitor — every route on the site,
 * spelled out.
 */
// No `robots` here on purpose. Next emits `<meta name="robots" content="noindex">`
// for this route by itself, and declaring it again only produced the tag twice —
// which is exactly the kind of duplicate a crawl audit flags.
export const metadata = {
  title: 'Страница не найдена · Calido Radiators',
};

export default function NotFound() {
  return (
    <Plate tone="ink" as="main" className="grid min-h-screen place-items-center">
      <div className="frame py-24 text-center">
        <p className="text-[clamp(4rem,14vw,9rem)] leading-none font-extrabold text-white/15">404</p>

        <h1 className="mt-6 text-[clamp(1.75rem,4vw,3rem)] font-extrabold text-white">
          Страница не найдена
        </h1>

        <p className="mx-auto mt-5 max-w-[46ch] text-base leading-relaxed text-white/80">
          Возможно, адрес набран с опечаткой или страница была перемещена.
          Ниже — все разделы сайта.
        </p>

        <Link
          href={pagePath('home', 'ru')}
          className="mt-10 inline-block bg-red-500 px-8 py-4 text-[0.75rem] font-bold tracking-[0.1em] text-white uppercase transition-colors hover:bg-red-700"
        >
          На главную
        </Link>

        <nav aria-label="Разделы сайта" className="mt-14">
          <ul className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            {PAGES.filter((p) => p.inNav).map((p) => (
              <li key={p.id}>
                <Link
                  href={pagePath(p.id, 'ru')}
                  className="flex min-h-11 items-center px-3 text-sm text-white/75 transition-colors hover:text-white"
                >
                  {ru.pages[p.id].nav}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </Plate>
  );
}
