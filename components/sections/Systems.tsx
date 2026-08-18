import { Section } from '@/components/layout/Section';
import { Img } from '@/components/ui/Img';
import { Reveal } from '@/components/ui/Reveal';
import { ScrubWarm } from '@/components/ui/ScrubWarm';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { Dictionary } from '@/content';

/**
 * 08 — Any heating system.
 *
 * Step 4 warms the interior frame on scrub: a red-100 wash spreading out from
 * the radiator on the wall.
 */
export function Systems({ dict }: { dict: Dictionary }) {
  return (
    <Section id="systems" index={dict.systems.index} tone="paper" labelledBy="systems-title">
      <div className="frame py-28 md:py-40">
        <Reveal className="max-w-4xl">
          <SectionHeading
            id="systems-title"
            kicker={dict.systems.kicker}
            title={dict.systems.title}
            tone="red"
          />
          <p className="prose-lead mt-8" data-reveal>
            {dict.systems.lead}
          </p>
          <p className="prose-lead mt-4" data-reveal>
            {dict.systems.sub}
          </p>
        </Reveal>

        <ScrubWarm className="relative mt-16 overflow-clip">
          <Img
            id="sections/interior"
            alt={dict.systems.imageAlt}
            sizes="100vw"
            data-warm-photo
            className="h-[52vh] w-full object-cover md:h-[68vh]"
          />
          <div
            aria-hidden
            data-warm-wash
            className="pointer-events-none absolute inset-0 opacity-0"
            style={{
              background:
                'radial-gradient(45% 55% at 68% 58%, var(--red-100) 0%, transparent 70%)',
              mixBlendMode: 'multiply',
            }}
          />
        </ScrubWarm>

        <Reveal className="grid-frame mt-16 gap-y-10" stagger={0.12}>
          {dict.systems.blocks.map((block) => (
            <div key={block.title} className="col-span-4 md:col-span-4" data-reveal>
              <p className="kicker mb-5">{block.title}</p>
              <ul className="flex flex-col gap-3 border-t border-line pt-5">
                {block.items.map((item) => (
                  <li key={item} className="text-base text-slate">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Reveal>
      </div>
    </Section>
  );
}
