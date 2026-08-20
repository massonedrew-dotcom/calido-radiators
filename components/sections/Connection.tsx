'use client';

import { useState } from 'react';

import { Section } from '@/components/layout/Section';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { Dictionary } from '@/content';

/**
 * How the radiator is plumbed in.
 *
 * The catalogue prints these as photographs with arrows drawn over them. The
 * first rebuild redrew them as vector but stopped at outline rectangles with
 * static arrowheads, which is the "drawn in Paint" the audit describes: no
 * volume, no motion, and a legend parked several centimetres away from the
 * thing it explained.
 *
 * What changed:
 *
 *   · the radiator is the product's own geometry — a manifold across the top,
 *     tapered fins with their cast web, threaded ports — not a box;
 *   · the coolant moves. A dashed stroke runs the path on an infinite
 *     `stroke-dashoffset` loop, red on the supply leg and indigo on the return,
 *     and it speeds up when the card is hovered;
 *   · the legend is on the arrows. "Supply" and "return" are printed at the
 *     stubs they name, so nothing has to be cross-referenced;
 *   · the cards have depth instead of a grey box behind them.
 *
 * The paragraph about the alloy that used to close this section has moved to
 * the technology section, which is what it is about.
 */

const FIN_X = [34, 63, 92, 121, 150, 179, 208] as const;
const FIN_W = 24;

/** Front elevation with enough of the real casting to be recognisable. */
function RadiatorGlyph() {
  return (
    <g aria-hidden>
      {/* Upper manifold, drawn as a solid so it reads as steel tube. */}
      <rect
        x={26}
        y={34}
        width={208}
        height={22}
        rx={7}
        fill="var(--color-indigo-700)"
        opacity={0.16}
      />
      <rect
        x={26}
        y={34}
        width={208}
        height={22}
        rx={7}
        fill="none"
        stroke="var(--color-indigo-700)"
        strokeWidth={1.2}
        opacity={0.55}
      />

      {FIN_X.map((x) => (
        <g key={x}>
          {/* Fin body, slightly tapered toward the foot the way the section is
              actually cast. */}
          <path
            d={`M${x} 56 H${x + FIN_W} L${x + FIN_W - 2.5} 168 H${x + 2.5} Z`}
            fill="var(--color-indigo-700)"
            opacity={0.09}
          />
          <path
            d={`M${x} 56 H${x + FIN_W} L${x + FIN_W - 2.5} 168 H${x + 2.5} Z`}
            fill="none"
            stroke="var(--color-indigo-700)"
            strokeWidth={1}
            opacity={0.5}
          />
          {/* Cast web down the centre of each fin. */}
          <line
            x1={x + FIN_W / 2}
            y1={64}
            x2={x + FIN_W / 2}
            y2={160}
            stroke="var(--color-indigo-700)"
            strokeWidth={0.8}
            opacity={0.3}
          />
          {/* Foot. */}
          <rect
            x={x + 8}
            y={168}
            width={8}
            height={9}
            rx={1.5}
            fill="var(--color-indigo-700)"
            opacity={0.28}
          />
        </g>
      ))}
    </g>
  );
}

type DiagramId = 'side' | 'bottom' | 'diagonal';

interface Leg {
  /** Where the pipe meets the frame edge. */
  readonly x: number;
  readonly y: number;
  /** 1 points right, -1 points left. */
  readonly dir: 1 | -1;
  readonly tone: 'supply' | 'return';
}

interface Diagram {
  /** Flow path, starting and ending flush with the radiator body. */
  readonly d: string;
  readonly legs: readonly Leg[];
}

const DIAGRAMS: Record<DiagramId, Diagram> = {
  // Enters top-left, loops around the far end, returns along the bottom.
  side: {
    d: 'M31 80 H152 A26 26 0 0 1 152 132 H31',
    legs: [
      { x: 11, y: 80, dir: 1, tone: 'supply' },
      { x: 31, y: 132, dir: -1, tone: 'return' },
    ],
  },
  // Straight through the bottom manifold, in at one end and out at the other.
  bottom: {
    d: 'M31 176 H229',
    legs: [
      { x: 11, y: 176, dir: 1, tone: 'supply' },
      { x: 229, y: 176, dir: 1, tone: 'return' },
    ],
  },
  // Steps down across the body from top-left to bottom-right.
  diagonal: {
    d: 'M31 80 H100 C124 80 128 150 152 150 H229',
    legs: [
      { x: 11, y: 80, dir: 1, tone: 'supply' },
      { x: 229, y: 150, dir: 1, tone: 'return' },
    ],
  },
};

function Stub({ leg, label }: { leg: Leg; label: string }) {
  // The arrow is a graphic and keeps the brand red; its printed label is text
  // at 10px and takes the AA-safe accent instead.
  const color = leg.tone === 'supply' ? 'var(--color-red-500)' : 'var(--color-indigo-700)';
  const labelColor = leg.tone === 'supply' ? 'var(--color-accent)' : 'var(--color-indigo-700)';
  const tip = leg.x + leg.dir * 20;
  return (
    <g>
      <line
        x1={leg.x}
        y1={leg.y}
        x2={tip - leg.dir * 5}
        y2={leg.y}
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path
        d={`M${tip} ${leg.y}L${tip - leg.dir * 7} ${leg.y - 4.5}L${tip - leg.dir * 7} ${leg.y + 4.5}Z`}
        fill={color}
      />
      {/* The legend, printed where the thing it names actually is. */}
      <text
        x={leg.x + leg.dir * 4}
        y={leg.y - 10}
        textAnchor={leg.dir === 1 ? 'start' : 'end'}
        fontSize="10"
        fontWeight="700"
        letterSpacing="1.2"
        fill={labelColor}
      >
        {label.toUpperCase()}
      </text>
    </g>
  );
}

function Diagram({
  id,
  title,
  legend,
  live,
}: {
  id: DiagramId;
  title: string;
  legend: { supply: string; return: string };
  live: boolean;
}) {
  const gradient = `flow-${id}`;
  const { d, legs } = DIAGRAMS[id];

  return (
    <svg viewBox="0 0 260 200" role="img" aria-label={title} className="h-auto w-full">
      <defs>
        {/*
          User-space gradient units, not object-bounding-box.

          A straight horizontal path has a zero-height bounding box and SVG
          skips gradient painting entirely in that case — which is how the
          bottom-connection line came to be invisible. User space also lets the
          ramp follow the flow rather than the screen X axis, so the return leg
          of the side loop stays indigo.
        */}
        <linearGradient
          id={gradient}
          gradientUnits="userSpaceOnUse"
          x1={legs[0]!.x}
          y1={legs[0]!.y}
          x2={legs[1]!.x}
          y2={legs[1]!.y}
        >
          <stop offset="0%" stopColor="var(--color-red-500)" />
          <stop offset="55%" stopColor="var(--color-red-500)" />
          <stop offset="100%" stopColor="var(--color-indigo-700)" />
        </linearGradient>
      </defs>

      <RadiatorGlyph />

      {/* Two strokes on one path: a static bed at low alpha so the route is
          always readable, and the moving dash on top of it. */}
      <path d={d} fill="none" stroke={`url(#${gradient})`} strokeWidth={2.4} opacity={0.22} />
      <path
        d={d}
        data-flow
        fill="none"
        stroke={`url(#${gradient})`}
        strokeWidth={2.8}
        strokeLinecap="round"
        strokeDasharray="16 22"
        style={{
          animation: `flow-dash ${live ? 0.9 : 2.4}s linear infinite`,
        }}
      />

      {legs.map((leg) => (
        <Stub key={`${leg.x}-${leg.y}`} leg={leg} label={legend[leg.tone]} />
      ))}
    </svg>
  );
}

export function Connection({ dict }: { dict: Dictionary }) {
  const [hot, setHot] = useState<string | null>(null);

  return (
    <Section id="connection" labelledBy="connection-title">
      <div className="frame section-pad">
        <Reveal className="max-w-3xl">
          <SectionHeading
            id="connection-title"
            title={dict.connection.title}
          />
        </Reveal>

        <Reveal className="grid-frame mt-10 gap-y-8" stagger={0.12}>
          {dict.connection.items.map((item) => (
            <figure
              key={item.id}
              data-reveal
              data-connection={item.id}
              onMouseEnter={() => setHot(item.id)}
              onMouseLeave={() => setHot(null)}
              className={[
                'col-span-4 border bg-surface-card p-6 backdrop-blur-sm transition-[transform,border-color,box-shadow] duration-500',
                hot === item.id
                  ? '-translate-y-1.5 border-red-500 shadow-[0_24px_50px_-28px_rgba(13,19,56,0.55)]'
                  : 'border-hairline',
              ].join(' ')}
              style={{ transitionTimingFunction: 'var(--ease-out-expo)' }}
            >
              <figcaption className="mb-5 flex items-baseline gap-3">
                <span className="tnum text-[0.8125rem] font-extrabold text-accent">
                  {item.num}
                </span>
                <span className="text-sm font-bold tracking-[0.06em] text-fg-strong uppercase">
                  {item.label}
                </span>
              </figcaption>

              <Diagram
                id={item.id as DiagramId}
                title={`${dict.connection.diagramAlt}: ${item.label}`}
                legend={dict.connection.legend}
                live={hot === item.id}
              />
            </figure>
          ))}
        </Reveal>
      </div>
    </Section>
  );
}
