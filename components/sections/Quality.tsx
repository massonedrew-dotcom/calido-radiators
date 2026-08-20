import { Section } from '@/components/layout/Section';
import { DrawnCheck } from '@/components/ui/DrawnCheck';
import { Img } from '@/components/ui/Img';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { Dictionary } from '@/content';

/** Quality control. */
export function Quality({ dict }: { dict: Dictionary }) {
  return (
    <Section id="quality" labelledBy="quality-title">

      <div className="frame section-pad-seam">
        <div className="grid-frame items-center gap-y-10">
          <Reveal className="col-span-4 md:col-span-5">
            <SectionHeading
              id="quality-title"
              title={dict.quality.title}
            />
            <p className="prose-lead mt-6" data-reveal>
              {dict.quality.lead}
            </p>
            <p className="prose-lead mt-4" data-reveal>
              {dict.quality.sub}
            </p>
          </Reveal>

          <div className="col-span-4 md:col-span-3 md:col-start-6">
            <Img
              id="hero/white"
              alt={dict.quality.imageAlt}
              sizes="(min-width: 768px) 24vw, 100vw"
              className="feather-edges mx-auto h-auto w-full max-w-xs"
            />
          </div>

          <Reveal className="col-span-4 md:col-span-3 md:col-start-10" stagger={0.12}>
            <ul className="flex flex-col gap-8">
              {dict.quality.checks.map((check, i) => (
                <li key={check} className="flex items-center gap-4" data-reveal>
                  <DrawnCheck className="shrink-0" delay={i * 0.18} />
                  <span className="text-sm leading-snug text-fg">{check}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
