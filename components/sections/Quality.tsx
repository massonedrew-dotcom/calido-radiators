import { Section } from '@/components/layout/Section';
import { ArcField } from '@/components/ui/ArcField';
import { DrawnCheck } from '@/components/ui/DrawnCheck';
import { Img } from '@/components/ui/Img';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { Dictionary } from '@/content';

/** 06 — Quality control. */
export function Quality({ dict }: { dict: Dictionary }) {
  return (
    <Section id="quality" index={dict.quality.index} tone="white" labelledBy="quality-title">
      <ArcField variant="both" />

      <div className="frame py-28 md:py-40">
        <div className="grid-frame items-center gap-y-16">
          <Reveal className="col-span-4 md:col-span-5">
            <SectionHeading
              id="quality-title"
              kicker={dict.quality.kicker}
              title={dict.quality.title}
            />
            <p className="prose-lead mt-8" data-reveal>
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
              className="mx-auto h-auto w-full max-w-xs"
            />
          </div>

          <Reveal className="col-span-4 md:col-span-3 md:col-start-10" stagger={0.12}>
            <ul className="flex flex-col gap-8">
              {dict.quality.checks.map((check, i) => (
                <li key={check} className="flex items-center gap-4" data-reveal>
                  <DrawnCheck className="shrink-0" delay={i * 0.18} />
                  <span className="text-sm leading-snug text-slate">{check}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
