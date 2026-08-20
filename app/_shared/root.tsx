import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import type { ReactNode } from 'react';

import type { Dictionary, Locale } from '@/content';
import { PAGE_OF_SECTION, PAGE_POLARITY, pagePath, SECTION_IDS, type PageId } from '@/lib/pages';
import { CHROME_COLOR } from '@/lib/thermal';

/**
 * Legacy `/#section` redirect, as a blocking inline script.
 *
 * Before the site was split, every section was an anchor on one page, so URLs
 * like `/#technology` and `/#warranty` are what the old nav emitted and what
 * any inbound link or bookmark still points at.
 *
 * It runs during parse, before React exists. That is deliberate: the first
 * attempt did this from a React effect and the replace landed mid-hydration,
 * leaving a dangling Suspense boundary with no shell. Running before hydration
 * means there is no hydration to interrupt, and the visitor never sees a frame
 * of the wrong page.
 *
 * NOT verified end to end in this repo's harness. The embedded preview pane
 * cannot render any document reached by script-driven navigation to a URL
 * containing a hash - reproduced with a bare
 * `location.replace('/about/#warranty')` from an unrelated settled page, with
 * none of this code in the path - so the redirect could only be confirmed as
 * far as "the URL changes correctly". To check it for real, open
 * `/#warranty` in an ordinary browser and confirm it lands on
 * `/about/#warranty` with the warranty section in view.
 *
 * The map is generated from the page registry, so a section that moves pages
 * cannot leave a stale redirect behind.
 */
function legacyHashRedirect(locale: Locale): string {
  const map: Record<string, string> = {};
  for (const id of SECTION_IDS) {
    map[id] = withBasePath(pagePath(PAGE_OF_SECTION[id], locale));
  }
  return (
    '(function(){try{' +
    `var m=${JSON.stringify(map)},h=location.hash.slice(1);` +
    'if(!h)return;var t=m[h];' +
    'if(t&&location.pathname!==t)location.replace(t+"#"+h);' +
    '}catch(e){}})();'
  );
}

import '../globals.css';

/**
 * Manrope stands in for Suisse Intl: same dense grotesque proportions, and it
 * is self-hosted by next/font, so there is no render-blocking third-party
 * request to pay for on first paint.
 */
const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
  preload: true,
});

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

import { withBasePath } from '@/lib/basePath';

/**
 * Viewport for one page, keyed to the page's polarity.
 *
 * `colorScheme` and `themeColor` were global and dark, which is right for four
 * of the six pages and wrong for the two light ones: on `/models` and
 * `/installation` the browser painted its own UI dark on a lit page - native
 * `<select>` menus, autofill dropdowns and the mobile address bar all came out
 * near-black against #e6eaf7.
 *
 * They are declared per page rather than in CSS on purpose. A `:root`
 * declaration wins over the meta tag, and `<html>` is rendered by the locale
 * layout, which does not know which page it is wrapping - so CSS could only
 * ever state one answer for the whole site. The meta tag is in the static HTML
 * of each page, so it is right before the first paint, with no hydration and no
 * class to thread through the tree.
 *
 * Polarity comes from the page registry, so a page that changes surface takes
 * its browser chrome with it.
 */
export function buildViewport(page: PageId = 'home'): Viewport {
  const polarity = PAGE_POLARITY[page];
  return {
    themeColor: CHROME_COLOR[polarity],
    colorScheme: polarity,
  };
}

/** Fallback for anything rendered by a layout rather than a page. */
export const viewport: Viewport = buildViewport('home');

/**
 * Metadata for one page.
 *
 * Titles and descriptions come from `dict.pages`, so the nav label, the browser
 * tab and the search snippet for a page are all written in one place. The home
 * page keeps the full descriptive title; every other page gets
 * "<Page> · Calido Radiators" through the template in the layout.
 */
export function buildMetadata(
  dict: Dictionary,
  locale: Locale,
  page: PageId = 'home',
): Metadata {
  const path = pagePath(page, locale);
  const copy = dict.pages[page];
  const title =
    page === 'home'
      ? locale === 'ru'
        ? 'Calido Radiators. Алюминиевые и биметаллические радиаторы'
        : 'Calido Radiators. Aluminium and bimetallic heating radiators'
      : copy.title;

  return {
    metadataBase: new URL(SITE_URL),
    title:
      page === 'home'
        ? { absolute: title, template: '%s · Calido Radiators' }
        : title,
    description: copy.description,
    applicationName: 'Calido Radiators',
    alternates: {
      canonical: path,
      languages: {
        'ru-RU': pagePath(page, 'ru'),
        en: pagePath(page, 'en'),
      },
    },
    openGraph: {
      type: 'website',
      url: path,
      siteName: 'Calido Radiators',
      locale: locale === 'ru' ? 'ru_RU' : 'en_US',
      alternateLocale: locale === 'ru' ? ['en_US'] : ['ru_RU'],
      title: page === 'home' ? `Calido Radiators. ${dict.brand.tagline}` : copy.title,
      description: copy.description,
    },
    twitter: { card: 'summary_large_image' },
    robots: { index: true, follow: true },
    // Declared explicitly rather than by file convention: with two root
    // layouts a conventional app/icon file only attaches to one of them.
    icons: { icon: [{ url: withBasePath('/icon.svg'), type: 'image/svg+xml' }] },
  };
}

/**
 * Shared <html>/<body> shell. Both locales get their own root layout so the
 * `lang` attribute is genuinely correct rather than patched on the client.
 */
export function RootShell({ dict, children }: { dict: Dictionary; children: ReactNode }) {
  return (
    <html lang={dict.htmlLang} className={manrope.variable}>
      <body>
        <script
          // First in the body so it runs before any of the app does.
          dangerouslySetInnerHTML={{
            __html: legacyHashRedirect(dict.locale === 'en' ? 'en' : 'ru'),
          }}
        />
        {children}
      </body>
    </html>
  );
}
