'use client';

import { useMemo, useState } from 'react';

import { Section } from '@/components/layout/Section';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { Dictionary } from '@/content';
import { MODELS } from '@/content/models';

/**
 * The range compared, at true relative scale.
 *
 * This used to be the seventh card of the model slider, which put a comparison
 * of the whole range behind a horizontal scroll and cut the sixth model off the
 * right edge. It is its own section now, because it answers a different
 * question from a product card.
 *
 * The honest problem with a height comparison here is that five of the six
 * models are within 33 mm of each other. At any scale that fits on a screen
 * that difference is roughly one pixel, so a bar chart alone would be a chart
 * that says nothing. Three things address that rather than hiding it:
 *
 *   · the bars share a baseline and are read against a real ruler with
 *     labelled gradations, so what is being compared is unambiguous;
 *   · every bar prints its own figure, so the exact difference is legible even
 *     where the geometry is not;
 *   · the metric switches. The models differ far more by heat output (168 to
 *     230 W) and weight (0.83 to 1.64 kg) than by height, and the switch is
 *     what turns "they all look the same" into the actual answer.
 *
 * Drawn as one inline SVG on a viewBox, so all six always fit whatever the
 * viewport is — the previous version was clipped at the right edge.
 */

type MetricId = 'height' | 'output' | 'weight';

/** Chart box in user units. The viewBox scales it; nothing here is in pixels. */
const W = 1000;
const H = 460;
const PAD_L = 74;
const PAD_R = 18;
const PAD_T = 30;
const BASE_Y = 372;

function valueOf(metric: MetricId, model: (typeof MODELS)[number]): number {
  if (metric === 'height') return model.section.height;
  const spec = model.specs.find((s) => (metric === 'output' ? s.key === 'heatOutput' : s.key === 'sectionWeight'));
  return spec?.value ?? 0;
}

/** Rounded, human tick step for an axis covering `span`. */
function tickStep(span: number): number {
  const raw = span / 4;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  const nice = norm >= 5 ? 5 : norm >= 2 ? 2 : 1;
  return nice * mag;
}

export function Scale({ dict }: { dict: Dictionary }) {
  const [metric, setMetric] = useState<MetricId>('height');
  const [hover, setHover] = useState<string | null>(null);

  const meta = dict.scale.metrics.find((m) => m.id === metric) ?? dict.scale.metrics[0]!;

  const { bars, ticks, top } = useMemo(() => {
    const values = MODELS.map((m) => valueOf(metric, m));
    const max = Math.max(...values);
    // Headroom so the tallest bar is not flush with the frame, and so the
    // labels above the bars have somewhere to sit.
    const ceiling = max * 1.12;
    const step = tickStep(ceiling);
    const marks: number[] = [];
    for (let v = 0; v <= ceiling; v += step) marks.push(v);

    const slotW = (W - PAD_L - PAD_R) / MODELS.length;
    const barW = slotW * 0.46;

    return {
      top: ceiling,
      ticks: marks,
      bars: MODELS.map((model, i) => {
        const value = values[i]!;
        const h = (value / ceiling) * (BASE_Y - PAD_T);
        return {
          model,
          value,
          x: PAD_L + slotW * i + (slotW - barW) / 2,
          w: barW,
          y: BASE_Y - h,
          h,
          centre: PAD_L + slotW * i + slotW / 2,
        };
      }),
    };
  }, [metric]);

  const fmt = (v: number) =>
    metric === 'weight'
      ? v.toFixed(2).replace('.', dict.locale === 'ru' ? ',' : '.')
      : String(Math.round(v));

  return (
    <Section id="scale" labelledBy="scale-title">
      <div className="frame section-pad">
        <div className="grid-frame items-end gap-y-8">
          <Reveal className="col-span-4 md:col-span-6">
            <SectionHeading id="scale-title" title={dict.scale.title} />
            <p className="prose-lead mt-6" data-reveal>
              {dict.scale.note}
            </p>
          </Reveal>

          <fieldset className="col-span-4 md:col-span-6">
            <legend className="mb-4 text-[0.8125rem] font-bold text-fg-strong">{dict.scale.metricLabel}</legend>
            <div className="flex flex-wrap gap-2">
              {dict.scale.metrics.map((m) => {
                const on = m.id === metric;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMetric(m.id as MetricId)}
                    aria-pressed={on}
                    className={[
                      'rounded-full border px-5 py-2 text-[0.75rem] font-bold tracking-[0.08em] uppercase transition-colors',
                      on
                        ? 'border-red-500 bg-red-500 text-white'
                        : 'border-hairline text-fg hover:border-indigo-500 hover:text-indigo-700',
                    ].join(' ')}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>

        <div className="mt-10" onMouseLeave={() => setHover(null)}>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label={dict.scale.lineupAlt}
            className="h-auto w-full"
          >
            {/* Ruler. Gradations are labelled, which is what makes a 33 mm
                difference legible as a quantity rather than as a shrug. */}
            <g aria-hidden>
              {ticks.map((t) => {
                const y = BASE_Y - (t / top) * (BASE_Y - PAD_T);
                return (
                  <g key={t}>
                    <line
                      x1={PAD_L - 10}
                      y1={y}
                      x2={W - PAD_R}
                      y2={y}
                      stroke="var(--color-hairline)"
                      strokeWidth={1}
                      strokeDasharray={t === 0 ? undefined : '3 6'}
                    />
                    <text
                      x={PAD_L - 18}
                      y={y + 4}
                      textAnchor="end"
                      className="tnum"
                      fontSize="13"
                      fill="var(--color-fg-mute)"
                    >
                      {fmt(t)}
                    </text>
                  </g>
                );
              })}

              {/* Shared baseline, drawn heavier than the gradations: this is
                  the line every model stands on. */}
              <line
                x1={PAD_L - 10}
                y1={BASE_Y}
                x2={W - PAD_R}
                y2={BASE_Y}
                stroke="var(--color-hairline-strong)"
                strokeWidth={2}
              />
              <text
                x={PAD_L - 18}
                y={BASE_Y + 22}
                textAnchor="end"
                fontSize="11"
                letterSpacing="1.6"
                fill="var(--color-fg-mute)"
              >
                {meta.unit}
              </text>
            </g>

            {/* role="list" parent: a bare role="listitem" has no owner and axe
                reports it, correctly, as a broken relationship. */}
            <g role="list">
            {bars.map(({ model, value, x, y, w, h, centre }) => {
              const on = hover === model.slug;
              return (
                <g
                  key={model.slug}
                  onMouseEnter={() => setHover(model.slug)}
                  onFocus={() => setHover(model.slug)}
                  onBlur={() => setHover(null)}
                  tabIndex={0}
                  role="listitem"
                  aria-label={`${model.name}: ${fmt(value)} ${meta.unit}`}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Datum from the top of the bar across to the ruler, so the
                      eye can carry a 33 mm difference to a labelled gradation
                      instead of guessing it. */}
                  <line
                    x1={PAD_L - 10}
                    y1={y}
                    x2={x}
                    y2={y}
                    stroke={on ? 'var(--color-red-500)' : 'var(--color-hairline)'}
                    strokeWidth={1}
                    strokeDasharray="2 5"
                    style={{ transition: 'stroke 240ms' }}
                  />

                  <rect
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    rx={3}
                    fill={on ? 'var(--color-red-500)' : 'var(--color-indigo-700)'}
                    style={{ transition: 'fill 240ms, y 420ms var(--ease-out-expo), height 420ms var(--ease-out-expo)' }}
                  />
                  {/* Section joints: enough of the product's own geometry that
                      a bar reads as a radiator rather than as a rectangle. */}
                  <g aria-hidden opacity={0.28}>
                    {[0.25, 0.5, 0.75].map((f) => (
                      <line
                        key={f}
                        x1={x + w * f}
                        y1={y + 5}
                        x2={x + w * f}
                        y2={BASE_Y - 5}
                        stroke="var(--color-paper)"
                        strokeWidth={1}
                      />
                    ))}
                  </g>

                  <text
                    x={centre}
                    y={y - 12}
                    textAnchor="middle"
                    className="tnum"
                    fontSize="17"
                    fontWeight="800"
                    fill={on ? 'var(--color-accent)' : 'var(--color-fg-strong)'}
                    style={{ transition: 'fill 240ms' }}
                  >
                    {fmt(value)}
                  </text>

                  <text
                    x={centre}
                    y={BASE_Y + 26}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="700"
                    letterSpacing="0.6"
                    fill={on ? 'var(--color-accent)' : 'var(--color-fg-strong)'}
                    style={{ transition: 'fill 240ms' }}
                  >
                    {model.name}
                  </text>
                  <text
                    x={centre}
                    y={BASE_Y + 46}
                    textAnchor="middle"
                    className="tnum"
                    fontSize="11"
                    fill="var(--color-fg-mute)"
                  >
                    {model.section.width} × {model.section.depth} × {model.section.height}
                  </text>
                </g>
              );
            })}
            </g>
          </svg>
        </div>
      </div>
    </Section>
  );
}
