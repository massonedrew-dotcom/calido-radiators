import type { ReactNode } from 'react';

import type { SectionId } from '@/lib/pages';

/**
 * Semantic wrapper for every scroll section.
 *
 * Sections are white and carry light ink. Full stop — there is no per-section
 * polarity lookup any more, because there is no longer a background that
 * changes underneath one. Where a section needs colour it lays a `Plate` inside
 * itself, and the plate brings its own ink with it.
 *
 * The `data-surface` attribute stays: the header reads it to decide whether it
 * is currently sitting over white or over a plate that runs to the top of the
 * section, which is the one case where a section still has something to say
 * about the chrome above it.
 */
export function Section({
  id,
  className = '',
  labelledBy,
  clip = true,
  plated = false,
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
  /** True where a dark plate reaches this section's own top edge. */
  plated?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      data-surface={plated ? 'dark' : 'light'}
      className={['relative isolate text-fg', clip ? 'overflow-clip' : '', className]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </section>
  );
}
