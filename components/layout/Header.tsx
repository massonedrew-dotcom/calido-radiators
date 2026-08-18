'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { Img } from '@/components/ui/Img';
import type { Dictionary } from '@/content';
import { ScrollTrigger } from '@/lib/gsap';

/**
 * Transparent over the hero, solid white once past it, and hidden while
 * scrolling down so it never covers a pinned section. Keeping it opaque off the
 * hero means it stays legible over the dark sections without any blend tricks.
 */
export function Header({ dict }: { dict: Dictionary }) {
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const lastY = useRef(0);

  useEffect(() => {
    const hero = document.getElementById('hero');
    const triggers: ScrollTrigger[] = [];

    if (hero) {
      triggers.push(
        ScrollTrigger.create({
          trigger: hero,
          start: 'bottom top+=80',
          onEnter: () => setSolid(true),
          onLeaveBack: () => setSolid(false),
        }),
      );
    }

    dict.nav.items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (!el) return;
      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          start: 'top 50%',
          end: 'bottom 50%',
          onToggle: (self) => self.isActive && setActive(item.id),
        }),
      );
    });

    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > 400 && y > lastY.current);
      lastY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      triggers.forEach((t) => t.kill());
      window.removeEventListener('scroll', onScroll);
    };
  }, [dict.nav.items]);

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

  const onLight = solid || menuOpen;

  return (
    <>
      <a
        href="#about"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:rounded-sm focus:bg-white focus:px-4 focus:py-2 focus:text-ink"
      >
        {dict.nav.skip}
      </a>

      <header
        className={[
          'fixed inset-x-0 top-0 z-50 transition-[transform,background-color,border-color] duration-500',
          hidden && !menuOpen ? '-translate-y-full' : 'translate-y-0',
          onLight ? 'border-b border-line bg-white/92 backdrop-blur-md' : 'border-b border-transparent',
        ].join(' ')}
        style={{ transitionTimingFunction: 'var(--ease-out-expo)' }}
      >
        <div className="frame flex h-18 items-center justify-between gap-6">
          <Link href="/" aria-label={dict.common.logoAlt} className="shrink-0">
            <Img
              id={onLight ? 'brand/logo' : 'brand/logo-white'}
              alt={dict.common.logoAlt}
              priority
              sizes="132px"
              className="h-7 w-auto"
            />
          </Link>

          <nav aria-label={dict.nav.label} className="hidden lg:block">
            <ul className="flex items-center gap-9">
              {dict.nav.items.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    aria-current={active === item.id ? 'true' : undefined}
                    className={[
                      'relative block py-1 text-[0.8125rem] font-medium tracking-[0.02em] transition-colors',
                      onLight ? 'text-slate hover:text-indigo-700' : 'text-white/80 hover:text-white',
                    ].join(' ')}
                  >
                    {item.label}
                    <span
                      aria-hidden
                      className={[
                        'absolute -bottom-0.5 left-0 h-px w-full origin-left bg-red-600 transition-transform duration-500',
                        active === item.id ? 'scale-x-100' : 'scale-x-0',
                      ].join(' ')}
                      style={{ transitionTimingFunction: 'var(--ease-out-expo)' }}
                    />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href={dict.alternate.href}
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

            <a
              href="#contact"
              className="hidden rounded-full bg-red-600 px-5 py-2.5 text-[0.75rem] font-bold tracking-[0.08em] text-white uppercase transition-colors hover:bg-[#c2181f] sm:block"
            >
              {dict.nav.cta}
            </a>

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
        <div id="mobile-nav" className="fixed inset-0 z-40 bg-white pt-18 lg:hidden">
          <nav aria-label={dict.nav.label} className="frame flex flex-col gap-2 py-8">
            {dict.nav.items.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setMenuOpen(false)}
                className="border-b border-line py-4 text-2xl font-extrabold tracking-[-0.02em] text-ink uppercase"
              >
                {item.label}
              </a>
            ))}
            <a
              href="#contact"
              onClick={() => setMenuOpen(false)}
              className="mt-6 rounded-full bg-red-600 px-6 py-4 text-center text-sm font-bold tracking-[0.08em] text-white uppercase"
            >
              {dict.nav.cta}
            </a>
          </nav>
        </div>
      ) : null}
    </>
  );
}
