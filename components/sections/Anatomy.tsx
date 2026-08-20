'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { Section } from '@/components/layout/Section';
import { Img } from '@/components/ui/Img';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { Dictionary } from '@/content';

/**
 * How a bimetallic section is put together, annotated on the real thing.
 *
 * Two earlier attempts at this were WebGL. The first exploded the geometry into
 * loose primitives - two cylinders, a plate and a stack of small blocks - and
 * hung six callouts around the edge on leader lines that touched nothing. The
 * second fixed the leaders and the part names but not the underlying problem:
 * a procedural radiator sitting a few hundred pixels from a photographed one
 * only advertises that it is not the photographed one.
 *
 * So the subject is now the photograph, which is how the client annotates parts
 * in their own printed catalogue. Every claim points at a feature a visitor can
 * see: the manifold port, a fin blade, the cast web, the painted face.
 *
 * The anchors are fractions of the image, measured off the source file
 * (public/models/bravo.webp, 1080x1200). Fractions rather than pixels because
 * the figure is fluid - and resolved against the letterboxed content box rather
 * than the element box, because `object-contain` means those are only the same
 * when the container happens to share the picture's aspect ratio. Locking the
 * container to 9:10 to make that true is the tempting shortcut and it is what
 * made the first version overflow the viewport: it left the height entirely to
 * whatever width the grid handed over. Measuring instead lets the figure be
 * sized for the fold.
 *
 * Leaders are laid out on resize and on image load, not per frame. Nothing here
 * moves on its own any more, so a ticker would be sixty recalculations a second
 * of four static lines.
 */

/** Intrinsic aspect of the annotated photograph, from the asset manifest. */
const PHOTO_RATIO = 1080 / 1200;

interface Anchor {
  /** Fraction of the image box, left to right. */
  x: number;
  /** Fraction of the image box, top to bottom. */
  y: number;
  /** Which column the callout sits in. */
  side: 'left' | 'right';
}

const ANCHORS: Record<string, Anchor> = {
  // Centre of the manifold port, upper right.
  collector: { x: 0.885, y: 0.185, side: 'right' },
  // A convection fin blade in the upper-left stack.
  fins: { x: 0.215, y: 0.245, side: 'left' },
  // The cast web running down the middle of the section.
  body: { x: 0.675, y: 0.455, side: 'right' },
  // The painted front face, where the coating is what you are looking at.
  coating: { x: 0.295, y: 0.735, side: 'left' },
};

export function Anatomy({ dict }: { dict: Dictionary }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const figureRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string | null>(null);
  const parts = dict.anatomy.parts;

  const left = parts.filter((p) => ANCHORS[p.id]?.side !== 'right');
  const right = parts.filter((p) => ANCHORS[p.id]?.side === 'right');

  const draw = useCallback(() => {
    const svg = svgRef.current;
    const figure = figureRef.current;
    if (!svg || !figure) return;

    const box = svg.getBoundingClientRect();
    const frame = figure.getBoundingClientRect();
    // Below `lg` the SVG is display:none and every rect is zero. Bail rather
    // than writing NaN into the points attribute.
    if (box.width === 0 || frame.width === 0) return;

    // Where `object-contain` actually put the picture inside its element.
    const wide = frame.width / frame.height > PHOTO_RATIO;
    const w = wide ? frame.height * PHOTO_RATIO : frame.width;
    const h = wide ? frame.height : frame.width / PHOTO_RATIO;
    const originX = frame.left + (frame.width - w) / 2;
    const originY = frame.top + (frame.height - h) / 2;

    // Read every label rect before writing any geometry: interleaving reads and
    // writes would force one reflow per callout instead of one for the pass.
    const reads = parts.map((part) => {
      const anchor = ANCHORS[part.id];
      const label = document.querySelector<HTMLElement>(`[data-anchor="${part.id}"]`);
      return { id: part.id, anchor, rect: label?.getBoundingClientRect() ?? null };
    });

    for (const { id, anchor, rect } of reads) {
      const line = svg.querySelector<SVGPolylineElement>(`[data-leader="${id}"]`);
      const dot = svg.querySelector<SVGCircleElement>(`[data-dot="${id}"]`);
      if (!line || !dot) continue;

      if (!anchor || !rect) {
        line.style.opacity = '0';
        dot.style.opacity = '0';
        continue;
      }

      const side = anchor.side === 'left' ? 1 : -1;
      const x1 = (anchor.side === 'left' ? rect.right : rect.left) - box.left;
      const y1 = rect.top + rect.height / 2 - box.top;
      const x2 = originX + w * anchor.x - box.left;
      const y2 = originY + h * anchor.y - box.top;

      // A short horizontal run out of the label before the diagonal, so the
      // line leaves the text on its baseline rather than skewing off it.
      line.setAttribute('points', `${x1 + side * 8},${y1} ${x1 + side * 30},${y1} ${x2},${y2}`);
      line.style.opacity = '1';
      dot.setAttribute('cx', String(x2));
      dot.setAttribute('cy', String(y2));
      dot.style.opacity = '1';
    }
  }, [parts]);

  useEffect(() => {
    draw();
    // ResizeObserver rather than a window listener: the columns also reflow when
    // the fonts land and when the breakpoint flips, neither of which is a resize.
    const observer = new ResizeObserver(draw);
    if (figureRef.current) observer.observe(figureRef.current);
    if (svgRef.current) observer.observe(svgRef.current);
    return () => observer.disconnect();
  }, [draw]);

  const callout = (part: (typeof parts)[number]) => {
    const side = ANCHORS[part.id]?.side ?? 'left';
    const on = active === part.id;
    return (
      <li
        key={part.id}
        data-reveal
        // Right-aligned only where the callouts actually flank the photograph.
        // Stacked full-width below , ragged-left is the readable default.
        // Right-aligned only where the callouts actually flank the photograph.
        // Below `lg` they stack full width and ragged-left is the readable one.
        className={side === 'right' ? 'lg:text-right' : ''}
        onMouseEnter={() => setActive(part.id)}
        onMouseLeave={() => setActive(null)}
      >
        <button
          type="button"
          onFocus={() => setActive(part.id)}
          onBlur={() => setActive(null)}
          aria-pressed={on}
          className={`block w-full cursor-default text-left ${side === 'right' ? 'lg:text-right' : ''}`}
        >
          <span
            data-anchor={part.id}
            className={[
              'inline-block text-[0.8125rem] font-bold tracking-[0.08em] uppercase transition-colors duration-300',
              on ? 'text-accent' : 'text-fg-strong',
            ].join(' ')}
          >
            {part.label}
          </span>
          <span
            className={[
              'mt-2 block max-w-[30ch] text-[0.875rem] leading-snug transition-colors duration-300',
              side === 'right' ? 'lg:ml-auto' : '',
              on ? 'text-fg-strong' : 'text-fg',
            ].join(' ')}
          >
            {part.text}
          </span>
        </button>
      </li>
    );
  };

  return (
    <Section id="anatomy" labelledBy="anatomy-title">
      <div className="frame section-pad">
        <Reveal className="max-w-3xl">
          <SectionHeading id="anatomy-title" title={dict.anatomy.title} />
          <p className="kicker mt-6 hidden text-fg-mute lg:block" data-reveal>
            {dict.anatomy.hint}
          </p>
        </Reveal>

        <div className="relative mt-12">
          {/* Leaders sit above the columns but below the pointer: the callouts
              have to stay hoverable through them. */}
          <svg
            ref={svgRef}
            aria-hidden
            focusable="false"
            className="pointer-events-none absolute inset-0 z-10 hidden h-full w-full lg:block"
            /*
             * A dark halo under every stroke. The leaders cross a photograph,
             * not a flat panel, and the hairline colour that reads correctly
             * over the indigo backdrop disappears the moment a line runs onto a
             * lit aluminium face - which is exactly where the coating callout
             * has to point. One drop-shadow on the whole overlay is cheaper
             * than doubling every line and ring with a backing stroke.
             */
            style={{ filter: 'drop-shadow(0 0 2.5px rgba(9, 13, 40, 0.9))' }}
          >
            {parts.map((part) => {
              const on = active === part.id;
              return (
                <g key={part.id}>
                  <polyline
                    data-leader={part.id}
                    points=""
                    fill="none"
                    stroke={on ? 'var(--color-accent)' : 'var(--color-hairline-strong)'}
                    strokeWidth={on ? 1.6 : 1}
                    style={{ opacity: 0, transition: 'stroke 240ms, stroke-width 240ms' }}
                  />
                  {/* A ring rather than a filled pip: it sits on top of a
                      photograph, and an outline stays legible over both the lit
                      faces and the shadowed ones. */}
                  <circle
                    data-dot={part.id}
                    r={on ? 7 : 4.5}
                    fill="none"
                    stroke={on ? 'var(--color-accent)' : 'var(--color-hairline-strong)'}
                    strokeWidth={on ? 2 : 1.4}
                    style={{ opacity: 0, transition: 'stroke 240ms, stroke-width 240ms, r 240ms' }}
                  />
                </g>
              );
            })}
          </svg>

          <div className="grid-frame items-center gap-y-10">
            <Reveal
              as="ul"
              className="col-span-4 flex flex-col justify-center gap-12 md:col-span-12 lg:col-span-3"
              stagger={0.1}
            >
              {left.map(callout)}
            </Reveal>

            {/* Six of twelve columns: the photograph gets half the frame, which
                is about 42% of the viewport at 1440 and satisfies the "at least
                40% of screen width" the audit asked for. Height is capped in
                viewport units rather than derived from that width, so the whole
                annotated figure clears the fold instead of running off it.

                `feather-cut`, not `feather-edges`: the source crop runs the
                product off its own left and bottom edges, and a radial feather
                would eat the middle of the section to reach the corners. */}
            <div
              ref={figureRef}
              className="relative col-span-4 h-[46svh] w-full self-center md:col-span-12 md:h-[54svh] lg:col-span-6 lg:h-[58svh]"
            >
              <Img
                id="models/bravo"
                alt={dict.anatomy.imageAlt}
                sizes="(min-width: 768px) 48vw, 80vw"
                onLoad={draw}
                className="feather-cut absolute inset-0 h-full w-full object-contain"
              />
            </div>

            <Reveal
              as="ul"
              className="col-span-4 flex flex-col justify-center gap-12 md:col-span-12 lg:col-span-3"
              stagger={0.1}
            >
              {right.map(callout)}
            </Reveal>
          </div>
        </div>
      </div>
    </Section>
  );
}
