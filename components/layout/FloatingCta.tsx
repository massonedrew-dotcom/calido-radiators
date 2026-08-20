'use client';

import { useEffect, useRef, useState } from 'react';

import { RequestForm } from '@/components/ui/RequestForm';
import type { Dictionary } from '@/content';
import type { PageId } from '@/lib/pages';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useReducedMotion } from '@/lib/hooks';

/**
 * The persistent way to convert, on every section past the hero.
 *
 * It opens a dialog rather than scrolling to the contact section: a CTA that
 * throws the visitor 12 000px down the page abandons whatever they were reading
 * and, on the way back, replays every entrance animation between here and
 * there. The form is the same component the contact section renders.
 *
 * The pulse is deliberately small — scale 1 to 1.04 over 2.5s on a sine — and
 * it stops the moment the pointer is over the button or the dialog is open, so
 * it never animates under a cursor that is trying to click it.
 */
export function FloatingCta({ dict, page }: { dict: Dictionary; page: PageId }) {
  const [shown, setShown] = useState(false);
  const suppressed = page === 'contact';
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreTo = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();

  // Appears once the hero is behind us, and retreats again if you scroll back.
  useEffect(() => {
    if (suppressed) return;
    // Pages other than home have no hero, so the button is available from the
    // top; only home makes the visitor clear the first screen first.
    const hero = document.getElementById('hero');
    if (!hero) {
      setShown(true);
      return;
    }
    const trigger = ScrollTrigger.create({
      // A range with `onToggle`, not a zero-length `onEnter`/`onLeaveBack`
      // pair. The pair depends on the scroll actually crossing the point; a
      // jump straight past it — an anchor link, a restored scroll position, a
      // deep link — leaves the button armed but invisible. A range is also
      // re-evaluated on every refresh, so it is correct after a resize.
      trigger: hero,
      start: 'bottom top+=120',
      end: () => ScrollTrigger.maxScroll(window),
      onToggle: (self) => setShown(self.isActive),
    });
    return () => trigger.kill();
  }, [suppressed]);

  // The pulse. One transform on one element, so it composites for free.
  useEffect(() => {
    const el = buttonRef.current;
    if (!el || reduced || !shown || open) return;
    const tween = gsap.to(el, {
      scale: 1.04,
      duration: 2.5,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    });
    return () => {
      tween.kill();
      gsap.set(el, { scale: 1 });
    };
  }, [reduced, shown, open]);

  // Dialog plumbing: Escape closes, focus is trapped inside and handed back.
  useEffect(() => {
    if (!open) return;
    restoreTo.current = document.activeElement as HTMLElement | null;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (e.key !== 'Tab') return;
      const root = dialogRef.current;
      if (!root) return;
      const focusable = root.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = '';
      restoreTo.current?.focus?.();
    };
  }, [open]);

  if (suppressed) return null;

  return (
    <>
      {/* Desktop: a pill in the corner. Mobile: a full-width sticky bar, which
          is the only placement that does not sit on top of body copy. */}
      <div
        className={[
          'fixed right-[max(1rem,3vw)] bottom-6 z-45 hidden transition-[opacity,transform] duration-500 lg:block',
          shown ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
        ].join(' ')}
        style={{ transitionTimingFunction: 'var(--ease-out-expo)' }}
      >
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-3 rounded-full bg-red-500 px-7 py-4 text-[0.75rem] font-bold tracking-[0.1em] text-white uppercase shadow-[0_12px_40px_-12px_rgba(217,18,34,0.7)] transition-colors hover:bg-red-700"
        >
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M2.6 3.4h10.8v7.6H6.2L3.4 13.4V11H2.6z" strokeLinejoin="round" />
          </svg>
          {dict.nav.cta}
        </button>
      </div>

      <div
        className={[
          'fixed inset-x-0 bottom-0 z-45 border-t border-line-dark bg-indigo-900/92 p-3 backdrop-blur-xl transition-transform duration-500 lg:hidden',
          shown ? 'translate-y-0' : 'translate-y-full',
        ].join(' ')}
        style={{
          transitionTimingFunction: 'var(--ease-out-expo)',
          paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))',
        }}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full rounded-full bg-red-500 px-6 py-3.5 text-[0.75rem] font-bold tracking-[0.1em] text-white uppercase"
        >
          {dict.nav.cta}
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-70 flex items-end justify-center sm:items-center">
          <button
            type="button"
            aria-label={dict.common.close}
            onClick={() => setOpen(false)}
            className="absolute inset-0 cursor-default bg-indigo-900/70 backdrop-blur-sm"
          />

          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cta-dialog-title"
            // `overscroll-contain`: without it, scrolling past the end of the
            // dialog scrolls the page behind it.
            className="on-dark relative max-h-[92svh] w-full max-w-lg overflow-y-auto overscroll-contain border border-hairline bg-indigo-900 p-8 shadow-2xl sm:rounded-lg"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute top-5 right-5 grid size-9 place-items-center rounded-full border border-line-dark text-white transition-colors hover:border-white"
            >
              <span className="sr-only">{dict.common.close}</span>
              <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
              </svg>
            </button>

            <p className="kicker mb-4">{dict.contact.kicker}</p>
            <h2 id="cta-dialog-title" className="display-sm text-white">
              {dict.contact.title}
            </h2>
            <p className="prose-lead mt-4">{dict.contact.lead}</p>

            {/* Focus lands on the first field, not on Submit. `autoFocus` used
                to go to the submit button, which is the one control in the
                dialog a visitor is not ready to use yet. */}
            <RequestForm dict={dict} tone="dark" className="mt-10" autoFocusFirstField />
          </div>
        </div>
      ) : null}
    </>
  );
}
