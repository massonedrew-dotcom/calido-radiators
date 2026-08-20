import { Section } from '@/components/layout/Section';
import { Counter } from '@/components/ui/Counter';
import { DrawnFactory } from '@/components/ui/DrawnFactory';
import { ParallaxImage } from '@/components/ui/ParallaxImage';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { Dictionary } from '@/content';

/** Production capacity — the cinder stage of the thermal arc. */
export function Capacity({ dict }: { dict: Dictionary }) {
  return (
    <Section id="capacity" labelledBy="capacity-title">
      <div className="frame section-pad">
        <div className="grid-frame items-center gap-y-12">
          <Reveal className="col-span-4 md:col-span-7">
            <SectionHeading
              id="capacity-title"
              title={dict.capacity.title}
            />

            <p className="kicker mt-10 mb-2 text-fg" data-reveal>
              {dict.capacity.more}
            </p>

            <p className="flex flex-col">
              <Counter
                to={dict.capacity.count}
                locale={dict.locale}
                /**
                 * 9.5vw, not 12.
                 *
                 * "5 000 000" is nine tabular glyphs, and the RU locale joins
                 * them with non-breaking spaces, so the string physically
                 * cannot wrap. At 12vw it measured 585px inside a 525px column
                 * at 1024 wide and ran straight under the product image — the
                 * reported "last zero disappears behind the radiator". 9.5vw
                 * is the largest setting where the widest string still clears
                 * the narrowest column across the whole breakpoint range.
                 */
                className="text-[clamp(3rem,9.5vw,9rem)] leading-[0.85] font-extrabold text-fg-strong"
                caption={dict.capacity.unit}
                captionClassName="mt-3 text-lg text-fg"
              />
            </p>

            <div className="mt-12 flex items-start gap-7" data-reveal>
              <DrawnFactory title={dict.capacity.factoryAlt} className="shrink-0" />
              <p className="max-w-[30ch] text-sm leading-relaxed text-fg">
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
