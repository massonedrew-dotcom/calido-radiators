import { Section } from '@/components/layout/Section';
import { Counter } from '@/components/ui/Counter';
import { HeatPlumes } from '@/components/ui/HeatPlumes';
import { Img } from '@/components/ui/Img';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { Dictionary } from '@/content';

/**
 * 06 — Heat output.
 *
 * Step 4 adds the rising convection plumes behind the product. This is one of
 * only two sections allowed to use the red rule, because the heading is
 * literally about temperature.
 */
export function HeatOutput({ dict }: { dict: Dictionary }) {
  return (
    <Section id="heat" labelledBy="heat-title">
      <div className="frame section-pad">
        <div className="grid-frame items-center gap-y-10">
          <Reveal className="col-span-4 md:col-span-5">
            <SectionHeading
              id="heat-title"
              title={dict.heat.title}
              tone="red"
            />
            <p className="prose-lead mt-6" data-reveal>
              {dict.heat.lead}
            </p>

            <p className="mt-10 flex items-baseline gap-4">
              <span className="kicker">{dict.heat.peakLabel}</span>
              <Counter
                to={dict.heat.peak}
                locale={dict.locale}
                duration={1.6}
                className="text-[clamp(3rem,8vw,7rem)] leading-none font-extrabold text-fg-strong"
                caption={dict.heat.peakUnit}
                captionClassName="text-sm text-fg"
              />
            </p>
          </Reveal>

          <div className="col-span-4 md:col-span-6 md:col-start-7">
            <div className="relative">
              {/* Behind the product, so the convection reads as coming off the
                  fins rather than floating in front of them. */}
              <HeatPlumes className="absolute inset-x-[6%] -top-[22%] bottom-[8%] h-[114%] w-[88%]" />
              <Img
                id="sections/heat-silver"
                alt={dict.heat.imageAlt}
                sizes="(min-width: 768px) 46vw, 100vw"
                className="relative h-auto w-full -rotate-8"
              />
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
