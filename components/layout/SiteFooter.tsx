import Link from 'next/link';

import { BrandMark } from '@/components/layout/BrandMark';
import { Plate } from '@/components/ui/Plate';
import { CONTACTS, FOOTER_CHANNELS, contactHref, opensInNewTab } from '@/content/contacts';
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
  // "2015–2026", collapsing to "2015" in the year the site was built. FOUNDED
  // is the same figure the About page and the topbar print, taken from the
  // dictionary rather than repeated here.
  const now = new Date().getFullYear();
  const founded = dict.about.since;
  const year = now > founded ? `${founded}–${now}` : String(founded);
  const locale = dict.locale === 'en' ? 'en' : 'ru';

  return (
    <Plate tone="ink" as="footer" className="relative">
      <div className="frame py-14">
        <div className="grid-frame gap-y-10">
          <div className="col-span-4 md:col-span-4">
            {/* A link, like the one in the header. A logo that is not clickable
                is a dead end at the bottom of every page, and it is the second
                internal link to the home page that a crawler expects to find. */}
            <Link
              href={pagePath('home', locale)}
              aria-label={dict.common.logoAlt}
              className="inline-block"
            >
              <BrandMark alt={dict.common.logoAlt} tone="dark" className="h-10 w-auto" />
            </Link>
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

          {/* Values from content/contacts.ts, labels from the dictionary — the
              footer and the direct-contact block under the form now print the
              same number because they read the same object, rather than because
              someone remembered to update both. Phone and e-mail are links
              here too: a footer number that cannot be tapped is a number that
              gets copied by hand. */}
          <div className="col-span-2 md:col-span-4">
            <ul className="flex flex-col gap-2">
              {FOOTER_CHANNELS.map((id) => {
                const href = contactHref(id);
                const label = dict.contact.details.labels[id];
                // Location has a label and no printable value, so repeating the
                // label as the link text would print "Локация  Локация".
                const value =
                  CONTACTS[id].display || (id === 'location' ? dict.contact.details.mapText : label);
                // Same rule as the block under the form: no value in the data
                // source, no row. A footer line reading "уточняется" is a
                // promise the site cannot keep.
                if (!CONTACTS[id].value) return null;
                return (
                  <li key={id} className="flex gap-3 text-sm text-fg">
                    <span className="w-20 shrink-0 text-fg-mute">{label}</span>
                    {href ? (
                      <a
                        href={href}
                        {...(opensInNewTab(id)
                          ? { target: '_blank', rel: 'noopener noreferrer' }
                          : {})}
                        aria-label={id === 'location' ? dict.contact.direct.locationAria : undefined}
                        className="break-words transition-colors hover:text-white"
                      >
                        {value}
                      </a>
                    ) : (
                      <span>{value}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Clear of the mobile sticky CTA bar, which is fixed over this. */}
        <p className="mt-12 pb-16 text-xs text-fg-mute lg:pb-0">
          {dict.contact.legal.replace('{year}', String(year))}
        </p>
      </div>
    </Plate>
  );
}
