import { Section } from '@/components/layout/Section';
import { Counter } from '@/components/ui/Counter';
import { ParallaxImage } from '@/components/ui/ParallaxImage';
import { Reveal } from '@/components/ui/Reveal';
import { Rule } from '@/components/ui/SectionHeading';
import { SplitHeading } from '@/components/ui/SplitHeading';
import type { Dictionary } from '@/content';

/** Who we are. Opens the about page, so it keeps the page eyebrow. */
export function About({ dict }: { dict: Dictionary }) {
  return (
    <Section id="about" labelledBy="about-title">

      <div className="frame section-pad">
        <div className="grid-frame items-center gap-y-10">
          <Reveal className="col-span-4 md:col-span-6">
            <p className="kicker mb-6" data-reveal>
              {dict.about.kicker}
            </p>
            <SplitHeading id="about-title" text={dict.about.title} className="display" />
            <div data-reveal>
              <Rule className="mt-8" />
            </div>
            <p className="prose-lead mt-6" data-reveal>
              {dict.about.lead}
            </p>

            <p className="mt-10 flex items-baseline gap-4" data-reveal>
              <span className="kicker">{dict.about.sinceLabel}</span>
              <Counter
                to={dict.about.since}
                locale={dict.locale}
                duration={1.4}
                group={false}
                className="text-[clamp(3rem,7vw,6rem)] leading-none font-extrabold text-fg-strong"
                caption={dict.about.sinceSuffix || undefined}
                captionClassName="text-sm text-fg"
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
