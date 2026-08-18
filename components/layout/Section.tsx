import type { ReactNode } from 'react';

import type { SectionId } from '@/content';

/**
 * Semantic wrapper for every scroll section. The `index` is the story-style
 * counter, rendered as a small marker in the top-left of the frame so the page
 * keeps the numbered rhythm of the source slides.
 */
export function Section({
  id,
  index,
  tone = 'white',
  className = '',
  labelledBy,
  clip = true,
  children,
}: {
  id: SectionId;
  index?: string;
  tone?: 'white' | 'paper' | 'dark';
  className?: string;
  labelledBy?: string;
  /**
   * Clipping has to be off wherever ScrollTrigger pins: the pinned element is
   * position-fixed, and an `overflow` ancestor clips it out of view.
   */
  clip?: boolean;
  children: ReactNode;
}) {
  const toneClass =
    tone === 'dark'
      ? 'on-dark bg-indigo-900'
      : tone === 'paper'
        ? 'bg-paper text-slate'
        : 'bg-white text-slate';

  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={`relative isolate ${clip ? 'overflow-clip' : ''} ${toneClass} ${className}`}
    >
      {/* The marker carries no opacity dimming: at 11px bold that was landing
          at 2.1:1. These tokens are already the quiet end of the palette. */}
      {index ? (
        <span
          aria-hidden
          className={`tnum pointer-events-none absolute top-8 left-[var(--frame-pad)] z-10 text-[0.6875rem] font-bold tracking-[0.18em] select-none ${
            tone === 'dark' ? 'text-indigo-100/80' : 'text-slate'
          }`}
        >
          {index}
        </span>
      ) : null}
      {children}
    </section>
  );
}
