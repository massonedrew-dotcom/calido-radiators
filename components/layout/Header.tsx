'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { BrandMark } from '@/components/layout/BrandMark';
import type { Dictionary } from '@/content';
import { getPage, PAGES, pagePath, SURFACE, type PageId } from '@/lib/pages';
import { ScrollTrigger } from '@/lib/gsap';

/**
 * Header height in px, at the widest breakpoint. Mirrors `lg:h-22` on the bar.
 *
 * Used as the offset for the surface-polarity triggers, so the swap happens as
 * the boundary passes under the bar's own lower edge rather than under the top
 * of the viewport. Narrow screens run 8px shorter, which is below the threshold
 * where anyone could see the difference in a crossfade.
 */
const BAR = 88;

/**
 * The header reads the surface underneath it rather than "am I past the hero".
 *
 * The old rule was binary — transparent over the hero, opaque white after it —
 * and it was wrong twice over once the page became one continuous thermal
 * surface: white-on-white where the story goes light, and a hard white slab
 * sitting on deep indigo where it goes dark again. Worse, over the hero it had
 * no backing at all, so the logo and the nav sat directly on the headline and
 * the two read as one tangled block of type.
 *
 * Now there are three states. At the very top of the hero the bar carries a
 * soft top-down scrim, which separates the marks from the headline without
 * putting a bar on the first impression. Past that it takes a blurred scrim in
 * whichever polarity the section under it declares, so it is always legible and
 * never fights the background. It still retracts on downward scroll, which is
 * what keeps it clear of the pinned sections.
 */
export function Header({ dict, page }: { dict: Dictionary; page: PageId }) {
  const sections = getPage(page).sections;
  const [atTop, setAtTop] = useState(true);
  const [surface, setSurface] = useState<'dark' | 'light'>('dark');
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastY = useRef(0);

  const locale = dict.locale === 'en' ? 'en' : 'ru';
  // The nav is derived from the page registry, so a page cannot exist without
  // being reachable, and cannot be listed twice with different labels.
  const navItems = PAGES.filter((p) => p.inNav);

  useEffect(() => {
    const triggers: ScrollTrigger[] = [];

    // Surface polarity: one trigger per section, measured at the bar's own
    // lower edge so the swap happens exactly as the boundary passes under it.
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          start: `top top+=${BAR}`,
          end: `bottom top+=${BAR}`,
          onToggle: (self) => self.isActive && setSurface(SURFACE[id]),
        }),
      );
    });

    const onScroll = () => {
      const y = window.scrollY;
      setAtTop(y < 40);
      setHidden(y > 400 && y > lastY.current);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      triggers.forEach((t) => t.kill());
      window.removeEventListener('scroll', onScroll);
    };
  }, [sections]);

  // Close the sheet on Escape and lock the page behind it.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('keydown', onKey);
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = '';
    };
  }, [menuOpen]);

  const onLight = surface === 'light' && !atTop && !menuOpen;

  const scrim = menuOpen
    ? 'bg-indigo-900'
    : atTop
      ? // No bar over the first impression, just enough of a wash to lift the
        // marks off the headline.
        'bg-gradient-to-b from-indigo-900/45 to-transparent'
      : surface === 'light'
        ? 'border-b border-line bg-paper/82 backdrop-blur-xl'
        : 'border-b border-line-dark bg-indigo-900/72 backdrop-blur-xl';

  return (
    <>
      <a
        href={`#${sections[0]}`}
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[70] focus:rounded-sm focus:bg-paper focus:px-4 focus:py-2 focus:text-ink"
      >
        {dict.nav.skip}
      </a>

      <header
        className={[
          // Above the GL stage (z-30), the progress rail (z-40) and the
          // floating CTA (z-45), so nothing can ever show through it.
          'fixed inset-x-0 top-0 z-60 transition-[transform,background-color,border-color] duration-500',
          hidden && !menuOpen ? '-translate-y-full' : 'translate-y-0',
          scrim,
        ].join(' ')}
        style={{ transitionTimingFunction: 'var(--ease-out-expo)' }}
      >
        <div className="frame flex h-20 items-center justify-between gap-6 lg:h-22">
          <Link href={pagePath('home', locale)} aria-label={dict.common.logoAlt} className="shrink-0">
            <BrandMark alt={dict.common.logoAlt} priority className="h-9 w-auto lg:h-10" />
          </Link>

          <nav aria-label={dict.nav.label} className="hidden lg:block">
            <ul className="flex items-center gap-9">
              {navItems.map((item) => (
                <li key={item.id}>
                  <Link
                    href={pagePath(item.id, locale)}
                    aria-current={page === item.id ? 'page' : undefined}
                    className={[
                      'relative block py-1 text-[0.8125rem] font-medium tracking-[0.02em] transition-colors',
                      onLight ? 'text-slate hover:text-indigo-700' : 'text-white/85 hover:text-white',
                    ].join(' ')}
                  >
                    {dict.pages[item.id].nav}
                    <span
                      aria-hidden
                      className={[
                        'absolute -bottom-0.5 left-0 h-px w-full origin-left bg-red-500 transition-transform duration-500',
                        page === item.id ? 'scale-x-100' : 'scale-x-0',
                      ].join(' ')}
                      style={{ transitionTimingFunction: 'var(--ease-out-expo)' }}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href={pagePath(page, locale === 'en' ? 'ru' : 'en')}
              title={dict.alternate.title}
              className={[
                'rounded-full border px-3 py-1.5 text-[0.6875rem] font-bold tracking-[0.14em] transition-colors',
                onLight
                  ? 'border-line text-indigo-700 hover:border-indigo-500 hover:text-indigo-500'
                  : 'border-white/30 text-white hover:border-white',
              ].join(' ')}
            >
              {dict.alternate.label}
            </Link>

            <Link
              href={pagePath('contact', locale)}
              className="hidden rounded-full bg-red-500 px-5 py-2.5 text-[0.75rem] font-bold tracking-[0.08em] text-white uppercase transition-colors hover:bg-red-700 sm:block"
            >
              {dict.nav.cta}
            </Link>

            <button
              type="button"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              onClick={() => setMenuOpen((v) => !v)}
              className={[
                'grid h-10 w-10 place-items-center rounded-full border transition-colors lg:hidden',
                onLight ? 'border-line text-ink' : 'border-white/30 text-white',
              ].join(' ')}
            >
              <span className="sr-only">{menuOpen ? dict.common.close : dict.nav.label}</span>
              <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5">
                {menuOpen ? (
                  <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
                ) : (
                  <path d="M3 7h14M3 13h14" strokeLinecap="round" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {menuOpen ? (
        <div id="mobile-nav" className="on-dark fixed inset-0 z-50 bg-indigo-900 pt-20 lg:hidden">
          {/*
            Driven by the same page registry as the desktop nav.

            It used to render `dict.nav.items` as `#section` anchors, which was
            correct while the site was one scroll and broken the moment it split
            into six pages: `#range` lives on /models and `#warranty` on /about,
            so on any other page those links pointed at nothing. The legacy hash
            map in app/_shared/root.tsx only runs on load, so it could not catch
            an in-page click either.
          */}
          <nav aria-label={dict.nav.label} className="frame flex flex-col gap-2 py-8">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={pagePath(item.id, locale)}
                aria-current={page === item.id ? 'page' : undefined}
                onClick={() => setMenuOpen(false)}
                className="border-b border-line-dark py-4 text-2xl font-extrabold tracking-[-0.02em] text-white uppercase"
              >
                {dict.pages[item.id].nav}
              </Link>
            ))}
            <Link
              href={pagePath('contact', locale)}
              onClick={() => setMenuOpen(false)}
              className="mt-6 rounded-full bg-red-500 px-6 py-4 text-center text-sm font-bold tracking-[0.08em] text-white uppercase"
            >
              {dict.nav.cta}
            </Link>
          </nav>
        </div>
      ) : null}
    </>
  );
}
