import type { ReactNode } from 'react';

import { SURFACE, type SectionId } from '@/lib/pages';

/**
 * Semantic wrapper for every scroll section.
 *
 * Sections have no background of their own. The page has exactly one, in
 * ThermalBackdrop, and all this does is set ink polarity from lib/pages.ts so
 * the copy colour and the colour behind it cannot disagree.
 *
 * The seam band that used to live here is gone. It existed to carry a
 * dark-to-light flip mid-page, and pages no longer flip: one polarity per page
 * is the rule now, and the temperature moves between pages instead.
 */
export function Section({
  id,
  className = '',
  labelledBy,
  clip = true,
  children,
}: {
  id: SectionId;
  className?: string;
  labelledBy?: string;
  /**
   * Clipping has to be off wherever ScrollTrigger pins: the pinned element is
   * position-fixed, and an `overflow` ancestor clips it out of view.
   */
  clip?: boolean;
  children: ReactNode;
}) {
  const dark = SURFACE[id] === 'dark';

  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      data-surface={dark ? 'dark' : 'light'}
      className={[
        'relative isolate',
        clip ? 'overflow-clip' : '',
        dark ? 'on-dark' : 'text-fg',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </section>
  );
}
