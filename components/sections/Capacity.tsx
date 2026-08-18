import { Section } from '@/components/layout/Section';
import { ArcField } from '@/components/ui/ArcField';
import { Counter } from '@/components/ui/Counter';
import { DrawnFactory } from '@/components/ui/DrawnFactory';
import { ParallaxImage } from '@/components/ui/ParallaxImage';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { Dictionary } from '@/content';

/** 03 — Production capacity. */
export function Capacity({ dict }: { dict: Dictionary }) {
  return (
    <Section id="capacity" index={dict.capacity.index} tone="white" labelledBy="capacity-title">
      <ArcField variant="right" />

      <div className="frame py-28 md:py-40">
        <div className="grid-frame gap-y-16">
          <Reveal className="col-span-4 md:col-span-7">
            <SectionHeading
              id="capacity-title"
              kicker={dict.capacity.kicker}
              title={dict.capacity.title}
            />

            <p className="kicker mt-14 mb-3 text-slate" data-reveal>
              {dict.capacity.more}
            </p>

            <p className="flex flex-col">
              <Counter
                to={dict.capacity.count}
                locale={dict.locale}
                className="text-[clamp(3.5rem,12vw,11rem)] leading-[0.85] font-extrabold text-ink"
                caption={dict.capacity.unit}
                captionClassName="mt-4 text-lg text-slate"
              />
            </p>

            <div className="mt-16 flex items-start gap-8" data-reveal>
              <DrawnFactory title={dict.capacity.factoryAlt} className="shrink-0" />
              <p className="max-w-[28ch] text-sm leading-relaxed text-slate">
                {dict.capacity.standards}
              </p>
            </div>
          </Reveal>

          <div className="col-span-4 md:col-span-5">
            <ParallaxImage
              id="sections/capacity-green"
              alt={dict.capacity.imageAlt}
              sizes="(min-width: 768px) 40vw, 100vw"
              className="h-auto w-full"
              from={12}
              to={-12}
            />
          </div>
        </div>
      </div>
    </Section>
  );
}
