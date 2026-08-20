'use client';

import { useEffect, useRef, useState } from 'react';

import { getPage, SURFACE, type PageId } from '@/lib/pages';
import { gsap, ScrollTrigger } from '@/lib/gsap';

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Reading progress, as a hairline.
 *
 * This replaces both the old numeric rail and the "02 / 04 / 07" markers that
 * used to sit in the corner of every section. Those read as debug output: a
 * visitor has no use for a section ordinal, and printing fourteen of them made
 * the page look like a wireframe that had been shipped by accident.
 *
 * What survives is the one thing the ordinal was standing in for — how far
 * through the story you are — expressed as a track, a fill and a dot that steps
 * to the active section. The numbers remain for screen readers, where a
 * position announcement genuinely is the most useful form.
 */
export function ProgressRail({
  page,
  label,
  of,
}: {
  page: PageId;
  label: string;
  of: string;
}) {
  const sections = getPage(page).sections;
  const total = sections.length;
  const fillRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const fill = fillRef.current;
    if (!fill) return;

    const triggers: ScrollTrigger[] = [];
    const setFill = gsap.quickSetter(fill, 'scaleY') as (v: number) => void;

    triggers.push(
      ScrollTrigger.create({
        // `maxScroll` rather than the root element's box — see the note in
        // ThermalBackdrop. Measured against the box, the fill reached 100%
        // while a fifth of the page was still below the fold.
        start: 0,
        end: () => ScrollTrigger.maxScroll(window),
        onUpdate: (self) => setFill(self.progress),
      }),
    );

    // One trigger per section keeps the active index correct through pinned
    // sections, where a plain offset lookup would drift.
    sections.forEach((id, index) => {
      const el = document.getElementById(id);
      if (!el) return;
      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          start: 'top 55%',
          end: 'bottom 55%',
          onToggle: (self) => {
            if (!self.isActive) return;
            setActive(index);
            // The rail sits on the page background, not on a card, so it has to
            // invert with the thermal surface or it vanishes on one half of it.
            setDark(SURFACE[id] === 'dark');
          },
        }),
      );
    });

    return () => triggers.forEach((t) => t.kill());
  }, [sections]);

  if (total < 2) return null;

  return (
    <aside
      aria-label={label}
      className="pointer-events-none fixed top-1/2 right-[max(1rem,3vw)] z-40 hidden -translate-y-1/2 lg:block"
    >
      <div
        className="relative h-[34vh] max-h-72 w-px transition-colors duration-500"
        style={{ backgroundColor: dark ? 'var(--color-line-dark)' : 'var(--color-line)' }}
      >
        <div
          ref={fillRef}
          className="absolute inset-x-0 top-0 h-full origin-top scale-y-0 bg-red-500"
          style={{ willChange: 'transform' }}
        />

        {/* Section dot: steps down the track rather than counting. */}
        <span
          aria-hidden
          className="absolute -left-[3px] block size-[7px] rounded-full bg-red-500 transition-[top] duration-700"
          style={{
            top: `${total > 1 ? (active / (total - 1)) * 100 : 0}%`,
            transform: 'translateY(-50%)',
            transitionTimingFunction: 'var(--ease-out-expo)',
          }}
        />
      </div>

      <p className="sr-only" role="status">
        {pad(active + 1)} {of} {pad(total)}
      </p>
    </aside>
  );
}
