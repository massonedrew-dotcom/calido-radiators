import { Section } from '@/components/layout/Section';
import { ArcField } from '@/components/ui/ArcField';
import { Img } from '@/components/ui/Img';
import { Leader } from '@/components/ui/Leader';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { Dictionary } from '@/content';

/**
 * 05 — What a bimetallic radiator is made of.
 *
 * Rebuilt from the printed catalogue spread: six callouts, three a side, each
 * sitting on a hairline leader that runs toward the product. The leader is a
 * scaled border rather than an SVG line so it stays crisp at any width and
 * animates on a single transform.
 */
function Callout({ text, side, delay }: { text: string; side: 'left' | 'right'; delay: number }) {
  const right = side === 'right';
  return (
    <li className={right ? 'text-right' : ''} data-reveal>
      <p className="max-w-[26ch] text-[0.9375rem] leading-snug text-slate md:ml-auto">{text}</p>
      <Leader side={side} delay={delay} />
    </li>
  );
}

export function Anatomy({ dict }: { dict: Dictionary }) {
  return (
    <Section id="anatomy" index={dict.anatomy.index} tone="paper" labelledBy="anatomy-title">
      <ArcField variant="right" />

      <div className="frame py-28 md:py-40">
        <Reveal className="max-w-4xl">
          <SectionHeading
            id="anatomy-title"
            kicker={dict.anatomy.kicker}
            title={dict.anatomy.title}
          />
        </Reveal>

        <div className="grid-frame mt-20 items-stretch gap-y-12">
          <Reveal
            as="ul"
            className="col-span-4 flex flex-col justify-between gap-10 md:col-span-3 md:order-1"
            stagger={0.1}
          >
            {dict.anatomy.left.map((text, i) => (
              <Callout key={text} text={text} side="left" delay={i * 0.12} />
            ))}
          </Reveal>

          <div
            data-gl-slot="anatomy"
            className="col-span-4 flex h-[64vh] items-center justify-center md:order-2 md:col-span-4 md:col-start-5"
          >
            <Img
              id="sections/qc-white"
              alt={dict.anatomy.imageAlt}
              sizes="(min-width: 768px) 32vw, 80vw"
              data-gl-fallback
              className="mx-auto h-full w-auto object-contain"
            />
          </div>

          <Reveal
            as="ul"
            className="col-span-4 flex flex-col justify-between gap-10 md:order-3 md:col-span-3 md:col-start-10"
            stagger={0.1}
          >
            {dict.anatomy.right.map((text, i) => (
              <Callout key={text} text={text} side="right" delay={i * 0.12} />
            ))}
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
