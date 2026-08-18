'use client';

import { useEffect, useRef, useState } from 'react';

import { SECTION_IDS } from '@/content';
import { gsap, ScrollTrigger } from '@/lib/gsap';

const TOTAL = SECTION_IDS.length;
const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Fixed rail on the right: a hairline track, a red fill scaled by document
 * progress, and the story-style NN/12 counter. Red is used here as the single
 * temperature accent, which is why the track itself stays indigo.
 */
export function ProgressRail({ label, of }: { label: string; of: string }) {
  const fillRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const fill = fillRef.current;
    if (!fill) return;

    const triggers: ScrollTrigger[] = [];

    triggers.push(
      ScrollTrigger.create({
        trigger: document.documentElement,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          gsap.set(fill, { scaleY: self.progress });
        },
      }),
    );

    // One trigger per section keeps the active index correct through pinned
    // sections, where a plain offset lookup would drift.
    SECTION_IDS.forEach((id, index) => {
      const el = document.getElementById(id);
      if (!el) return;
      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          start: 'top 55%',
          end: 'bottom 55%',
          onToggle: (self) => {
            if (self.isActive) setActive(index);
          },
        }),
      );
    });

    return () => triggers.forEach((t) => t.kill());
  }, []);

  return (
    <aside
      aria-label={label}
      className="pointer-events-none fixed top-1/2 right-[max(1rem,3vw)] z-40 hidden -translate-y-1/2 lg:block"
    >
      <div className="flex flex-col items-center gap-5">
        <span
          aria-hidden
          className="tnum text-[0.8125rem] leading-none font-extrabold text-red-600"
        >
          {pad(active + 1)}
        </span>

        <div className="relative h-[38vh] max-h-80 w-px bg-line">
          <div
            ref={fillRef}
            className="absolute inset-x-0 top-0 h-full origin-top scale-y-0 bg-red-600"
          />
        </div>

        <span aria-hidden className="tnum text-[0.6875rem] leading-none font-medium text-slate">
          {pad(TOTAL)}
        </span>
      </div>

      <p className="sr-only" role="status">
        {pad(active + 1)} {of} {pad(TOTAL)}
      </p>
    </aside>
  );
}
