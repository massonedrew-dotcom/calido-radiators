'use client';

import { useState } from 'react';

import { useScrollPosition } from '@/lib/hooks';

/**
 * Back to top.
 *
 * The pages here run long — the model range alone is six cards and a chart —
 * and the only way back to the nav was the header, which retracts on the way
 * down by design. This is the other half of that decision.
 *
 * Placement is the whole problem. The floating CTA already owns the bottom
 * right on every page, and the mobile layout puts a sticky enquiry bar across
 * the bottom edge, so a conventional bottom-right button would land on top of
 * one or both. It sits bottom-left instead, above the progress rail's z-index
 * but below the header's, and only on the wide breakpoint where there is no
 * sticky bar to collide with.
 *
 * Lenis drives the page's scrolling, and calling `window.scrollTo` while a
 * smooth-scroll library is running fights it — the library keeps its own
 * target and snaps back on the next frame. So this goes through the instance
 * SmoothScroll publishes on `window.__lenis`, falling back to the native call
 * on the reduced-motion path, where no instance is ever created.
 */
export function ScrollTop({ label }: { label: string }) {
  const [shown, setShown] = useState(false);

  // Two viewports down: far enough that returning is a real journey, close
  // enough that it appears before the visitor starts looking for it.
  useScrollPosition((y) => setShown(y > window.innerHeight * 2));

  const toTop = () => {
    const lenis = (window as unknown as { __lenis?: { scrollTo: (t: number) => void } }).__lenis;
    if (lenis) lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label={label}
      // Kept in the DOM rather than unmounted, so the fade has something to
      // animate and assistive tech is not handed an element that appears and
      // disappears with scroll position.
      tabIndex={shown ? 0 : -1}
      aria-hidden={!shown}
      className={[
        'fixed bottom-6 left-6 z-45 hidden size-11 place-items-center border border-line-dark',
        'bg-white text-indigo-700 shadow-sm transition-all duration-400',
        'hover:border-indigo-500 hover:text-red-500 lg:grid',
        shown ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0',
      ].join(' ')}
      style={{ transitionTimingFunction: 'var(--ease-out-expo)' }}
    >
      <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
