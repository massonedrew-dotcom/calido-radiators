import { Section } from '@/components/layout/Section';
import { Counter } from '@/components/ui/Counter';
import { DrawnFactory } from '@/components/ui/DrawnFactory';
import { ParallaxImage } from '@/components/ui/ParallaxImage';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { Dictionary } from '@/content';

/**
 * Splits a sentence around a substring, so one span of it can be marked up
 * without the dictionary having to carry HTML.
 *
 * Falls back to the whole sentence unmarked if the substring is not present —
 * a translation that rephrases "EN и ISO" should lose the emphasis, not the
 * sentence.
 */
function splitOnMark(sentence: string, mark: string): { text: string; mark: boolean }[] {
  const at = mark ? sentence.indexOf(mark) : -1;
  if (at < 0) return [{ text: sentence, mark: false }];
  return [
    { text: sentence.slice(0, at), mark: false },
    { text: mark, mark: true },
    { text: sentence.slice(at + mark.length), mark: false },
  ].filter((p) => p.text.length > 0);
}

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

            {/*
              A certification claim, not a footnote. It was 14px of muted grey
              at body weight, which is the styling the site gives to an aside -
              so the one sentence on the page that says the plant is audited
              against EN and ISO read as small print under the figure it is
              meant to qualify.

              Weight 600 and the heading ink, both already in the scale (the
              topbar's values are `font-semibold`; `text-fg-strong` is what
              every heading uses). Deliberately not 700: at two lines beside a
              120px numeral, bold stops reading as emphasis and starts reading
              as a second heading.

              `gap-5` below the md breakpoint. At 375px the frame leaves about
              250px beside the factory mark, and 28px of it spent on a gutter is
              a line break bought for nothing.
            */}
            <div className="mt-12 flex items-start gap-5 md:gap-7" data-reveal>
              <DrawnFactory title={dict.capacity.factoryAlt} className="shrink-0" />
              <p className="max-w-[30ch] text-base leading-relaxed font-semibold text-fg-strong">
                {/*
                  <strong> rather than a second colour. The standards are the
                  payload of the sentence - everything around them is the frame -
                  so the emphasis is semantic and a screen reader gets it too. A
                  third ink inside a two-line caption would only make it busier.
                */}
                {splitOnMark(dict.capacity.standards, dict.capacity.standardsMark).map((part, i) =>
                  part.mark ? (
                    <strong key={i} className="font-extrabold">
                      {part.text}
                    </strong>
                  ) : (
                    <span key={i}>{part.text}</span>
                  ),
                )}
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
