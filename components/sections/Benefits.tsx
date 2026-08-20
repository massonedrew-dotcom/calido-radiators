import { Section } from '@/components/layout/Section';
import { DrawnCheck } from '@/components/ui/DrawnCheck';
import { ParallaxImage } from '@/components/ui/ParallaxImage';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { Dictionary } from '@/content';

/** The four product claims, on the home page. */
export function Benefits({ dict }: { dict: Dictionary }) {
  return (
    <Section id="benefits" labelledBy="benefits-title">
      <div className="frame section-pad">
        <div className="grid-frame items-center gap-y-10">
          <Reveal className="col-span-4 md:col-span-5" stagger={0.12} start="top 78%">
            <SectionHeading
              id="benefits-title"
              title={dict.benefits.title}
            />
            <ul className="mt-10 flex flex-col gap-7">
              {dict.benefits.items.map((item, i) => (
                <li key={item} className="flex items-center gap-5" data-reveal>
                  <DrawnCheck className="shrink-0" delay={i * 0.12} />
                  <span className="text-lg leading-snug text-fg-strong">{item}</span>
                </li>
              ))}
            </ul>
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
      </div>
    </Section>
  );
}
