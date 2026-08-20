import Link from 'next/link';

import { BrandMark } from '@/components/layout/BrandMark';
import type { Dictionary } from '@/content';
import { PAGES, pagePath } from '@/lib/pages';

/**
 * Footer, on every page.
 *
 * Split out of the contact section when the site became multi-page: the
 * contact details and the sitemap are chrome, not content of one page, and
 * leaving them inside `Contact` would have made them reachable only from the
 * page a visitor lands on last.
 */
export function SiteFooter({ dict }: { dict: Dictionary }) {
  const year = new Date().getFullYear();
  const locale = dict.locale === 'en' ? 'en' : 'ru';

  return (
    <footer className="on-dark relative z-1 border-t border-hairline bg-indigo-900">
      <div className="frame py-14">
        <div className="grid-frame gap-y-10">
          <div className="col-span-4 md:col-span-4">
            <BrandMark alt={dict.common.logoAlt} className="h-10 w-auto" />
            <p className="mt-5 max-w-[32ch] text-sm text-fg-mute">{dict.brand.tagline}</p>
          </div>

          <nav className="col-span-2 md:col-span-4" aria-label={dict.nav.label}>
            <ul className="flex flex-col gap-2">
              {PAGES.filter((p) => p.inNav).map((p) => (
                <li key={p.id}>
                  <Link
                    href={pagePath(p.id, locale)}
                    className="text-sm text-fg transition-colors hover:text-white"
                  >
                    {dict.pages[p.id].nav}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="col-span-2 md:col-span-4">
            <ul className="flex flex-col gap-2">
              {dict.contact.details.items.map((item) => (
                <li key={item.label} className="flex gap-3 text-sm text-fg">
                  <span className="w-20 shrink-0 text-fg-mute">{item.label}</span>
                  <span>{item.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Clear of the mobile sticky CTA bar, which is fixed over this. */}
        <p className="mt-12 pb-16 text-xs text-fg-mute lg:pb-0">
          {dict.contact.legal.replace('{year}', String(year))}
        </p>
      </div>
    </footer>
  );
}
