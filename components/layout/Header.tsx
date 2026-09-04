'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { BrandMark } from '@/components/layout/BrandMark';
import type { Dictionary } from '@/content';
import { useScrollPosition } from '@/lib/hooks';
import { PAGES, pagePath, type PageId } from '@/lib/pages';

/**
 * The bar. White, opaque, and the same on every page.
 *
 * It used to run a ScrollTrigger per section to sample what colour it was
 * currently floating over, then swap its own scrim and every ink colour in it
 * to match — three visual states, a listener per section, and a stretch at the
 * top of the home page where it had no backing at all and the logo sat directly
 * on the headline.
 *
 * None of that has anything left to do. The page is white from the top of the
 * first section to the bottom of the last, so the bar is white, its ink is ink,
 * and the only thing it still reacts to is scroll *direction* — it retracts on
 * the way down, which is what keeps it clear of the pinned sections.
 *
 * The hairline is not decoration: without it a white bar over white content has
 * no edge at all, and the nav appears to float in the middle of the copy the
 * moment the topbar plate has scrolled away.
 */
export function Header({ dict, page }: { dict: Dictionary; page: PageId }) {
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastY = useRef(0);

  const locale = dict.locale === 'en' ? 'en' : 'ru';
  // The nav is derived from the page registry, so a page cannot exist without
  // being reachable, and cannot be listed twice with different labels.
  const navItems = PAGES.filter((p) => p.inNav);

  // Through the shared subscription rather than a window listener. Lenis clips
  // overflow on html and body and scrolls the page itself, so the native event
  // never fires and this retract had quietly stopped working everywhere except
  // the reduced-motion path — see `useScrollPosition`.
  useScrollPosition((y) => {
    setHidden(y > 400 && y > lastY.current);
    lastY.current = y;
  });

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

  return (
    <>
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[70] focus:bg-indigo-700 focus:px-4 focus:py-2 focus:text-white"
      >
        {dict.nav.skip}
      </a>

      <header
        className={[
          // Above the progress rail (z-40) and the floating CTA (z-45), so
          // nothing can ever show through it.
          'sticky top-0 z-60 border-b border-line bg-white transition-transform duration-500',
          hidden && !menuOpen ? '-translate-y-full' : 'translate-y-0',
        ].join(' ')}
        style={{ transitionTimingFunction: 'var(--ease-out-expo)' }}
      >
        <div className="frame flex h-18 items-center justify-between gap-6 lg:h-20">
          <Link href={pagePath('home', locale)} aria-label={dict.common.logoAlt} className="shrink-0">
            <BrandMark alt={dict.common.logoAlt} priority className="h-9 w-auto lg:h-10" />
          </Link>

          <nav aria-label={dict.nav.label} className="hidden lg:block">
            <ul className="flex items-center gap-8">
              {navItems.map((item) => (
                <li key={item.id}>
                  <Link
                    href={pagePath(item.id, locale)}
                    aria-current={page === item.id ? 'page' : undefined}
                    className={[
                      'relative block py-6 text-[0.75rem] font-bold tracking-[0.1em] uppercase transition-colors',
                      page === item.id ? 'text-indigo-700' : 'text-slate hover:text-indigo-700',
                    ].join(' ')}
                  >
                    {dict.pages[item.id].nav}
                    {/*
                      A plate, not an underline: 4px of red welded to the bottom
                      of the bar under the current page. Same object as the seam
                      under the page-header band, which is what ties the two
                      together as one piece of chrome.
                    */}
                    <span
                      aria-hidden
                      className={[
                        'absolute -bottom-px left-0 h-1 w-full origin-left bg-red-500 transition-transform duration-500',
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
              className="border border-line px-3 py-1.5 text-[0.6875rem] font-bold tracking-[0.14em] text-indigo-700 transition-colors hover:border-indigo-500 hover:bg-paper"
            >
              {dict.alternate.label}
            </Link>

            {/* Not on the contact page itself: the button would point at the
                page it is already on, and it would sit one hairline above that
                page's own red header plate — red on red, reading as a bleed
                rather than as a control. */}
            {page === 'contact' ? null : (
              <Link
                href={pagePath('contact', locale)}
                className="hidden bg-red-500 px-5 py-3 text-[0.6875rem] font-bold tracking-[0.1em] text-white uppercase transition-colors hover:bg-red-700 sm:block"
              >
                {dict.nav.cta}
              </Link>
            )}

            <button
              type="button"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              onClick={() => setMenuOpen((v) => !v)}
              className="grid size-10 place-items-center border border-line text-ink lg:hidden"
            >
              <span className="sr-only">{menuOpen ? dict.common.close : dict.nav.label}</span>
              <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6">
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
            Driven by the same page registry as the desktop nav, so the sheet
            cannot list a page the bar does not, or point at an in-page anchor
            that lives on some other page.
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
              className="mt-6 bg-red-500 px-6 py-4 text-center text-sm font-bold tracking-[0.1em] text-white uppercase"
            >
              {dict.nav.cta}
            </Link>
          </nav>
        </div>
      ) : null}
    </>
  );
}
