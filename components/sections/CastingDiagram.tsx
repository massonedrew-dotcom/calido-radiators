'use client';

import { forwardRef, useImperativeHandle, useRef } from 'react';

/**
 * High-pressure die casting, as a scrubbed cross-section.
 *
 * This replaces a WebGL scene. The procedural version was rebuilt twice and was
 * never good: boxes and cylinders lit by a hand-written shader cannot hold their
 * own next to the studio product renders sitting on the same page, and the mould
 * in particular read as two grey slabs rather than as steel tooling.
 *
 * Engineering line-work is the honest register for a process nobody can
 * photograph, and the site already speaks it: the connection diagrams on the
 * installation page use the same indigo outline plus red flow. Reusing that
 * language here makes the two technical sections look like one system.
 *
 * Three decisions carry the drawing:
 *
 *   - The cavity is the section's own front silhouette - two collector bands
 *     with cored waterways, a slim body, four pairs of fins. A first pass drew
 *     it as a plain slot between the halves and it read as a dumbbell. If the
 *     void is not recognisably a radiator, none of the rest means anything.
 *
 *   - The void is cut out of the halves rather than drawn between them. The
 *     parting plane is the centreline, each half is masked by the cavity, and
 *     so each carries its own half of the impression - which is what you see
 *     when they draw apart, and which fills the space between the fins with
 *     steel instead of leaving it empty.
 *
 *   - The blocks are hatched at 45 degrees. Section hatching is the one
 *     convention that says "cut solid material" without a caption, and it is
 *     what stops a filled rectangle from reading as a slab. Together with the
 *     centreline and the parting-line ticks it also needs no translating, which
 *     is why the drawing carries no words at all. The three stages are named in
 *     the list beside it.
 *
 * Progress is pushed in imperatively from the section's ScrollTrigger. Routing
 * it through React state would re-render this subtree on every frame of a 170vh
 * pin; the handful of attributes that actually change are written straight to
 * the DOM instead.
 */

export interface CastingDiagramHandle {
  set(progress: number): void;
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Hermite ramp of the `a`..`b` window. */
function span(p: number, a: number, b: number) {
  const t = clamp01((p - a) / (b - a));
  return t * t * (3 - 2 * t);
}

/* --- geometry, in a 560x440 user-unit frame ------------------------------- */

/** Parting plane. Both halves meet here and the cavity is sunk half into each. */
const AXIS = 280;

/** Outer extent of the cavity, where the fins and the collectors reach. */
const WALL_L = 212;
const WALL_R = 348;

const CAV_TOP = 60;
const CAV_BOTTOM = 380;

/** Collector bands, top and bottom. */
const BAND_H = 48;
const BODY_TOP = CAV_TOP + BAND_H;
const BODY_BOTTOM = CAV_BOTTOM - BAND_H;
const R = 16;

/** The slim body between the collectors. */
const BODY_L = 258;
const BODY_R = 302;

const FIN_H = 24;
const FIN_Y = [122, 172, 222, 272];

const OUTER_L = 60;
const OUTER_R = 500;
const MOULD_TOP = 26;
const MOULD_BOTTOM = 414;

const BOLTS = [78, 148, 218, 288, 358];

/**
 * The cavity as one closed path rather than a pile of overlapping rectangles.
 *
 * Rectangles are easier to write and wrong to draw: stroking them leaves the
 * fin-to-body and band-to-body joins as lines across the middle of a part that
 * is cast in one piece. Tracing the silhouette once, clockwise from the top
 * left, produces only edges that really exist - and the same path then serves as
 * the fill for the casting, the clip for the melt, and the void in the mould.
 */
function cavityPath(): string {
  const d = [`M${WALL_L} ${CAV_TOP + R}`, `A${R} ${R} 0 0 1 ${WALL_L + R} ${CAV_TOP}`];

  // Top band, left to right.
  d.push(`H${WALL_R - R}`, `A${R} ${R} 0 0 1 ${WALL_R} ${CAV_TOP + R}`);
  d.push(`V${BODY_TOP - R}`, `A${R} ${R} 0 0 1 ${WALL_R - R} ${BODY_TOP}`, `H${BODY_R}`);

  // Down the right flank, stepping out at every fin.
  for (const y of FIN_Y) d.push(`V${y}`, `H${WALL_R}`, `V${y + FIN_H}`, `H${BODY_R}`);

  // Bottom band, right to left.
  d.push(`V${BODY_BOTTOM}`, `H${WALL_R - R}`, `A${R} ${R} 0 0 1 ${WALL_R} ${BODY_BOTTOM + R}`);
  d.push(`V${CAV_BOTTOM - R}`, `A${R} ${R} 0 0 1 ${WALL_R - R} ${CAV_BOTTOM}`);
  d.push(`H${WALL_L + R}`, `A${R} ${R} 0 0 1 ${WALL_L} ${CAV_BOTTOM - R}`);
  d.push(`V${BODY_BOTTOM + R}`, `A${R} ${R} 0 0 1 ${WALL_L + R} ${BODY_BOTTOM}`, `H${BODY_L}`);

  // Back up the left flank.
  for (const y of [...FIN_Y].reverse()) d.push(`V${y + FIN_H}`, `H${WALL_L}`, `V${y}`, `H${BODY_L}`);

  d.push(`V${BODY_TOP}`, `H${WALL_L + R}`, `A${R} ${R} 0 0 1 ${WALL_L} ${BODY_TOP - R}`, 'Z');
  return d.join(' ');
}

const CAVITY = cavityPath();

const BLOCK_L = `M${AXIS} ${MOULD_TOP} H${OUTER_L + 10} a10 10 0 0 0 -10 10 V${MOULD_BOTTOM - 10} a10 10 0 0 0 10 10 H${AXIS} Z`;
const BLOCK_R = `M${AXIS} ${MOULD_TOP} H${OUTER_R - 10} a10 10 0 0 1 10 10 V${MOULD_BOTTOM - 10} a10 10 0 0 1 -10 10 H${AXIS} Z`;

export const CastingDiagram = forwardRef<CastingDiagramHandle, { title: string }>(
  function CastingDiagram({ title }, ref) {
    const leftRef = useRef<SVGGElement>(null);
    const rightRef = useRef<SVGGElement>(null);
    const fillRef = useRef<SVGRectElement>(null);
    const frontRef = useRef<SVGRectElement>(null);
    const sprueRef = useRef<SVGGElement>(null);
    const castRef = useRef<SVGGElement>(null);
    const heatRef = useRef<SVGStopElement>(null);

    useImperativeHandle(ref, () => ({
      set(p: number) {
        // Windows overlap so every frame is a blend of two stages rather than a
        // slideshow: the pour is still finishing as the mould starts to open.
        const fill = span(p, 0.22, 0.68);
        const open = span(p, 0.6, 0.95);
        const cool = span(p, 0.66, 1);
        const hot = fill * (1 - cool);

        const shift = open * 96;
        leftRef.current?.setAttribute('transform', `translate(${-shift} 0)`);
        rightRef.current?.setAttribute('transform', `translate(${shift} 0)`);

        // Metal rises against gravity, so the fill grows from the bottom edge.
        const height = (CAV_BOTTOM - CAV_TOP) * fill;
        const top = CAV_BOTTOM - height;
        fillRef.current?.setAttribute('y', String(top));
        fillRef.current?.setAttribute('height', String(height));
        // The advancing front, brightest right at the meniscus.
        frontRef.current?.setAttribute('y', String(top - 9));
        frontRef.current?.setAttribute('opacity', String(hot * 0.85));

        // Injection only matters while metal is actually moving.
        sprueRef.current?.setAttribute('opacity', String(Math.min(1, fill * 3) * (1 - open)));

        // The casting cools from ember through brand red to finished alloy.
        heatRef.current?.setAttribute(
          'stop-color',
          hot > 0.5 ? '#ff7a3c' : hot > 0.15 ? '#d91222' : '#9aa4c0',
        );
        // Cold aluminium fades in over the top of the cooling melt, so the last
        // stage is the product rather than a dark red ghost of it.
        castRef.current?.setAttribute('opacity', String(cool));
      },
    }));

    const half = (side: -1 | 1) => {
      const block = side === -1 ? BLOCK_L : BLOCK_R;
      const boltX = side === -1 ? OUTER_L + 28 : OUTER_R - 28;
      const boreX = side === -1 ? OUTER_L + 74 : OUTER_R - 74;
      return (
        <>
          {/* Fill and outline in one masked element, so the outline follows the
              impression instead of running straight down the parting plane. */}
          <path
            d={block}
            mask="url(#cast-void)"
            fill="rgba(9, 13, 40, 0.66)"
            stroke="var(--color-indigo-300)"
            strokeWidth={1.3}
          />
          <path d={block} mask="url(#cast-void)" fill="url(#cast-hatch)" />
          {/* This half's share of the cavity outline. Clipped to its own side of
              the parting plane and carried along when the block draws back. */}
          <path
            d={CAVITY}
            clipPath={side === -1 ? 'url(#cast-side-l)' : 'url(#cast-side-r)'}
            fill="none"
            stroke="var(--color-indigo-300)"
            strokeWidth={1.4}
          />
          {BOLTS.map((y) => (
            <circle
              key={y}
              cx={boltX}
              cy={y}
              r={6}
              fill="none"
              stroke="var(--color-indigo-300)"
              strokeWidth={1.2}
              opacity={0.8}
            />
          ))}
          {/* Cooling bore, dashed because it runs behind the cut plane. */}
          <path
            d={`M${boreX} ${MOULD_TOP + 34} V${MOULD_BOTTOM - 34}`}
            stroke="var(--color-indigo-300)"
            strokeWidth={1}
            strokeDasharray="7 6"
            opacity={0.55}
            fill="none"
          />
        </>
      );
    };

    return (
      <svg
        viewBox="0 0 560 440"
        role="img"
        aria-label={title}
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="cast-melt" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#7d0b16" />
            <stop offset="65%" stopColor="#d91222" />
            <stop ref={heatRef} offset="100%" stopColor="#ff7a3c" />
          </linearGradient>
          <linearGradient id="cast-alloy" x1="0" y1="0" x2="1" y2="0.35">
            <stop offset="0%" stopColor="#6f7ba0" />
            <stop offset="42%" stopColor="#c9d0e4" />
            <stop offset="100%" stopColor="#7a86ac" />
          </linearGradient>
          <pattern
            id="cast-hatch"
            width={9}
            height={9}
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line x1={0} y1={0} x2={0} y2={9} stroke="var(--color-indigo-300)" strokeWidth={1} opacity={0.24} />
          </pattern>

          {/* The void. White keeps the block, black removes the cavity from it. */}
          <mask id="cast-void" maskUnits="userSpaceOnUse" x={-200} y={0} width={960} height={440}>
            <rect x={-200} y={0} width={960} height={440} fill="#fff" />
            <path d={CAVITY} fill="#000" />
          </mask>

          <clipPath id="cast-side-l">
            <rect x={-200} y={0} width={AXIS + 200} height={440} />
          </clipPath>
          <clipPath id="cast-side-r">
            <rect x={AXIS} y={0} width={760} height={440} />
          </clipPath>
          <clipPath id="cast-cavity">
            <path d={CAVITY} />
          </clipPath>
        </defs>

        {/* Centreline. Pure drawing convention, and it holds the composition
            together while the halves are apart. */}
        <path
          d={`M${AXIS} 14 V426`}
          stroke="var(--color-indigo-300)"
          strokeWidth={1}
          strokeDasharray="16 5 3 5"
          opacity={0.38}
          fill="none"
        />

        {/* Molten metal, clipped to the cavity so it can only rise inside it. */}
        <g clipPath="url(#cast-cavity)">
          <rect ref={fillRef} x={WALL_L} y={CAV_BOTTOM} width={WALL_R - WALL_L} height={0} fill="url(#cast-melt)" />
          <rect ref={frontRef} x={WALL_L} y={CAV_BOTTOM} width={WALL_R - WALL_L} height={11} fill="#ff7a3c" opacity={0} />
        </g>

        {/* Finished casting, fading in over the cooling melt. */}
        <g ref={castRef} opacity={0}>
          <path d={CAVITY} fill="url(#cast-alloy)" stroke="var(--color-indigo-100)" strokeWidth={1.2} />
        </g>

        {/* Cores. They form the waterway, so metal never reaches them - which is
            why they are drawn after the melt rather than under it. */}
        {[BODY_TOP - BAND_H / 2, BODY_BOTTOM + BAND_H / 2].map((cy) => (
          <circle
            key={cy}
            cx={AXIS}
            cy={cy}
            r={15}
            fill="rgba(9, 13, 40, 0.94)"
            stroke="var(--color-indigo-300)"
            strokeWidth={1.3}
          />
        ))}

        <g ref={leftRef}>{half(-1)}</g>
        <g ref={rightRef}>{half(1)}</g>

        {/* Parting-line ticks, marking the plane the halves separate on. */}
        <g stroke="var(--color-indigo-300)" strokeWidth={1.1} opacity={0.55} fill="none">
          <path d={`M${OUTER_L} 16 V${MOULD_TOP - 2}`} />
          <path d={`M${OUTER_R} 16 V${MOULD_TOP - 2}`} />
          <path d={`M${OUTER_L} 18 H${OUTER_R}`} strokeDasharray="4 5" />
        </g>

        {/* Injection: the sprue feeding the cavity from below under pressure. */}
        <g ref={sprueRef} opacity={0}>
          <path
            d={`M${AXIS} 434 V${CAV_BOTTOM + 14}`}
            stroke="var(--color-red-500)"
            strokeWidth={3.5}
            strokeLinecap="round"
          />
          <path d={`M${AXIS} ${CAV_BOTTOM + 2} l-8 14 h16 Z`} fill="var(--color-red-500)" />
        </g>
      </svg>
    );
  },
);
