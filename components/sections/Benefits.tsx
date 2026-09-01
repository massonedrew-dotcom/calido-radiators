import { Section } from '@/components/layout/Section';
import { DrawnCheck } from '@/components/ui/DrawnCheck';
import { ParallaxImage } from '@/components/ui/ParallaxImage';
import { PlateBadge } from '@/components/ui/Plate';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { Dictionary } from '@/content';

/**
 * The four product claims, on the home page.
 *
 * They used to be a bulleted list beside the product still — four ticks and
 * four lines of text, which is the correct amount of structure for four short
 * phrases and the wrong amount of presence for the only claims the home page
 * makes.
 *
 * Now they are the page's plate row: four bounded white cells with a solid
 * indigo square overhanging the top edge of each. The overhang is the whole
 * point — the square breaks the cell's own border, so the colour is visibly
 * laid *on* the white rather than filling a box inside it. It is the same
 * gesture as the topbar strip and the page-header band at a smaller scale, and
 * it is what makes four cells read as one system rather than as four cards.
 *
 * No body copy under the headings. There is none in the source material, and a
 * line of invented marketing under each claim would be the only sentence on the
 * site nobody at the factory wrote.
 */
export function Benefits({ dict }: { dict: Dictionary }) {
  return (
    <Section id="benefits" labelledBy="benefits-title">
      <div className="frame section-pad">
        <div className="grid-frame items-center gap-y-10">
          <Reveal className="col-span-4 md:col-span-5">
            <SectionHeading id="benefits-title" title={dict.benefits.title} />
          </Reveal>

          <div className="col-span-4 md:col-span-6 md:col-start-7">
            <ParallaxImage
              id="sections/benefits-indigo"
              alt={dict.benefits.imageAlt}
              sizes="(min-width: 768px) 46vw, 100vw"
              className="h-auto w-full"
              from={14}
              to={-14}
              rotate={[2.5, -2.5]}
            />
          </div>
        </div>

        {/*
          `gap-px` over a hairline-coloured background, rather than a border on
          every cell: adjacent cells would otherwise meet as two 1px lines and
          the row would read as slightly heavier down the middle than at its
          edges. The extra top padding is the badge's overhang clearance.
        */}
        <Reveal
          as="ul"
          className="mt-20 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4"
          stagger={0.1}
          start="top 84%"
        >
          {dict.benefits.items.map((item, i) => (
            <li key={item} data-reveal className="flex flex-col bg-white px-7 pt-0 pb-9">
              <PlateBadge tone="indigo">
                <DrawnCheck size={28} delay={i * 0.12} />
              </PlateBadge>
              <h3 className="mt-6 text-[1.0625rem] leading-tight tracking-[0.02em]">{item}</h3>
            </li>
          ))}
        </Reveal>
      </div>
    </Section>
  );
}
