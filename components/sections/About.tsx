import { Section } from '@/components/layout/Section';
import { ArcField } from '@/components/ui/ArcField';
import { Counter } from '@/components/ui/Counter';
import { ParallaxImage } from '@/components/ui/ParallaxImage';
import { Reveal } from '@/components/ui/Reveal';
import { Rule } from '@/components/ui/SectionHeading';
import { SplitHeading } from '@/components/ui/SplitHeading';
import type { Dictionary } from '@/content';

/** 02 — Who we are. */
export function About({ dict }: { dict: Dictionary }) {
  return (
    <Section id="about" index={dict.about.index} tone="paper" labelledBy="about-title">
      <ArcField variant="right" />

      <div className="frame py-28 md:py-40">
        <div className="grid-frame items-center gap-y-14">
          <Reveal className="col-span-4 md:col-span-6">
            <p className="kicker mb-6" data-reveal>
              {dict.about.kicker}
            </p>
            <SplitHeading id="about-title" text={dict.about.title} className="display" />
            <div data-reveal>
              <Rule className="mt-8" />
            </div>
            <p className="prose-lead mt-8" data-reveal>
              {dict.about.lead}
            </p>

            <p className="mt-10 flex items-baseline gap-4" data-reveal>
              <span className="kicker">{dict.about.sinceLabel}</span>
              <Counter
                to={dict.about.since}
                locale={dict.locale}
                duration={1.4}
                group={false}
                className="text-[clamp(3rem,7vw,6rem)] leading-none font-extrabold text-ink"
                caption={dict.about.sinceSuffix || undefined}
                captionClassName="text-sm text-slate"
              />
            </p>
          </Reveal>

          <div className="col-span-4 md:col-span-6">
            <ParallaxImage
              id="sections/about-steel"
              alt={dict.about.imageAlt}
              sizes="(min-width: 768px) 46vw, 100vw"
              className="h-auto w-full"
              from={15}
              to={-15}
            />
          </div>
        </div>
      </div>
    </Section>
  );
}
