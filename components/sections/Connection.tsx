import { Section } from '@/components/layout/Section';
import { DrawnFlow } from '@/components/ui/DrawnFlow';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { Dictionary } from '@/content';

/**
 * 10 — Connection methods.
 *
 * The catalogue prints these as photographs with arrows drawn over them. They
 * are redrawn here as vector: the source is a phone photo of a printed page,
 * and a schematic reads better at card size anyway.
 *
 * Red is the supply leg and indigo the return leg — the one place besides the
 * thermal sections where red carries information rather than emphasis.
 */

const FIN_X = [31, 60, 89, 118, 147, 176, 205] as const;

/** Line-art front elevation, drawn once and reused by all three diagrams. */
function RadiatorGlyph() {
  return (
    <g stroke="var(--color-indigo-700)" strokeWidth={1.1} fill="none" opacity={0.55}>
      {/* upper fin pack, drawn as one mass — dividers here only added noise */}
      <rect x={26} y={34} width={208} height={22} rx={3} />
      {FIN_X.map((x) => (
        <rect key={`f${x}`} x={x} y={56} width={24} height={112} rx={2} />
      ))}
      {FIN_X.map((x) => (
        <rect key={`n${x}`} x={x + 9} y={168} width={6} height={8} rx={1} />
      ))}
    </g>
  );
}

/** Short external arrow marking where the pipe enters or leaves. */
function Stub({ x, y, dir, tone }: { x: number; y: number; dir: 1 | -1; tone: 'supply' | 'return' }) {
  const color = tone === 'supply' ? 'var(--color-red-600)' : 'var(--color-indigo-700)';
  const tip = x + dir * 20;
  return (
    <g data-stub>
      <line x1={x} y1={y} x2={tip - dir * 5} y2={y} stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <path d={`M${tip} ${y}L${tip - dir * 6} ${y - 4}L${tip - dir * 6} ${y + 4}Z`} fill={color} />
    </g>
  );
}

type DiagramId = 'side' | 'bottom' | 'diagonal';

interface Diagram {
  /** Flow path, starting and ending flush with the radiator body. */
  readonly d: string;
  /**
   * Gradient axis in user space. Object-bounding-box units are unusable here:
   * a straight horizontal path has a zero-height box, and SVG skips gradient
   * painting entirely in that case — the bottom-connection line vanished.
   * User space also lets the ramp follow the flow rather than the screen X
   * axis, so the return leg of the side loop stays indigo.
   */
  readonly grad: readonly [number, number, number, number];
  readonly stubs: readonly { x: number; y: number; dir: 1 | -1; tone: 'supply' | 'return' }[];
}

const DIAGRAMS: Record<DiagramId, Diagram> = {
  // Enters top-left, loops around the far end, returns along the bottom.
  side: {
    d: 'M31 80 H152 A26 26 0 0 1 152 132 H31',
    grad: [0, 80, 0, 132],
    stubs: [
      { x: 11, y: 80, dir: 1, tone: 'supply' },
      { x: 31, y: 132, dir: -1, tone: 'return' },
    ],
  },
  // Straight through the bottom manifold, in at one end and out at the other.
  bottom: {
    d: 'M31 176 H229',
    grad: [31, 0, 229, 0],
    stubs: [
      { x: 11, y: 176, dir: 1, tone: 'supply' },
      { x: 229, y: 176, dir: 1, tone: 'return' },
    ],
  },
  // Steps down across the body from top-left to bottom-right.
  diagonal: {
    d: 'M31 80 H100 C124 80 128 150 152 150 H229',
    grad: [31, 80, 229, 150],
    stubs: [
      { x: 11, y: 80, dir: 1, tone: 'supply' },
      { x: 229, y: 150, dir: 1, tone: 'return' },
    ],
  },
};

function Diagram({ id, title }: { id: DiagramId; title: string }) {
  const gradient = `flow-${id}`;
  const { d, grad, stubs } = DIAGRAMS[id];
  const [gx1, gy1, gx2, gy2] = grad;

  return (
    <svg viewBox="0 0 260 200" role="img" aria-label={title} className="h-auto w-full">
      <defs>
        <linearGradient
          id={gradient}
          gradientUnits="userSpaceOnUse"
          x1={gx1}
          y1={gy1}
          x2={gx2}
          y2={gy2}
        >
          <stop offset="0%" stopColor="var(--color-red-600)" />
          <stop offset="100%" stopColor="var(--color-indigo-700)" />
        </linearGradient>
      </defs>

      <RadiatorGlyph />

      <path
        d={d}
        data-flow
        fill="none"
        stroke={`url(#${gradient})`}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {stubs.map((s) => (
        <Stub key={`${s.x}-${s.y}`} {...s} />
      ))}
    </svg>
  );
}

export function Connection({ dict }: { dict: Dictionary }) {
  return (
    <Section id="connection" index={dict.connection.index} tone="white" labelledBy="connection-title">
      <div className="frame py-28 md:py-40">
        <Reveal className="max-w-3xl">
          <SectionHeading
            id="connection-title"
            kicker={dict.connection.kicker}
            title={dict.connection.title}
          />

          <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3" data-reveal>
            {(
              [
                ['supply', dict.connection.legend.supply, 'bg-red-600'],
                ['return', dict.connection.legend.return, 'bg-indigo-700'],
              ] as const
            ).map(([key, label, dot]) => (
              <li key={key} className="flex items-center gap-2.5 text-[0.8125rem] text-slate">
                <span aria-hidden className={`size-2 rounded-full ${dot}`} />
                {label}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal className="grid-frame mt-16 gap-y-12" stagger={0.14}>
          {dict.connection.items.map((item) => (
            <figure
              key={item.id}
              data-reveal
              data-connection={item.id}
              className="col-span-4 border border-line bg-paper p-7"
            >
              <figcaption className="mb-6 flex items-baseline gap-3">
                <span className="tnum text-[0.8125rem] font-extrabold text-indigo-700">
                  {item.num}
                </span>
                <span className="text-sm font-bold tracking-[0.06em] text-ink uppercase">
                  {item.label}
                </span>
              </figcaption>

              <DrawnFlow>
                <Diagram
                  id={item.id as DiagramId}
                  title={`${dict.connection.diagramAlt} — ${item.label}`}
                />
              </DrawnFlow>
            </figure>
          ))}
        </Reveal>

        <Reveal className="mt-16 md:mt-20">
          <p className="prose-lead" data-reveal>
            {dict.connection.body}
          </p>
        </Reveal>
      </div>
    </Section>
  );
}
