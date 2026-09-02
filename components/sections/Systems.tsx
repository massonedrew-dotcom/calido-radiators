import { Section } from '@/components/layout/Section';
import { Img } from '@/components/ui/Img';
import { Reveal } from '@/components/ui/Reveal';
import { ScrubWarm } from '@/components/ui/ScrubWarm';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { Dictionary } from '@/content';

/**
 * Any heating system.
 *
 * The source frame is a white radiator on a white wall, and the first build ran
 * it full-bleed at its original crop — so the product dissolved into the
 * background and the left third of the picture was a blown-out window carrying
 * no information at all.
 *
 * The crop moved (see `sections/interior` in scripts/prep-assets.mjs): the
 * window is gone and the radiator is the compositional centre. That alone is
 * the separation, and it is now the only one.
 *
 * What was here before and why it went: the room was pushed back with an
 * inline `saturate(0.28) blur(3px) brightness(0.62)` and a second, tighter
 * plate of the product was laid back over it at full contrast, feathered so it
 * would dissolve into the treated room. It never dissolved. ScrubWarm animates
 * the `filter` property of `[data-warm-photo]` wholesale — `saturate(0.94)
 * brightness(1)` to `saturate(1.06) brightness(1.03)` — so the moment the
 * section was scrolled the blur and the darkening were overwritten out of
 * existence. The room came back to full contrast under a full-contrast inset,
 * and the composite read as exactly the pasted rectangle the feather was there
 * to prevent.
 *
 * One photograph, one vignette. The warm scrub stays because it is a filter on
 * that single image and no longer fights anything.
 */
export function Systems({ dict }: { dict: Dictionary }) {
  return (
    <Section id="systems" labelledBy="systems-title">
      <div className="frame section-pad">
        <div className="grid-frame items-center gap-y-10">
          <Reveal className="col-span-4 md:col-span-5">
            <SectionHeading
              id="systems-title"
              kicker={dict.systems.kicker}
              title={dict.systems.title}
              tone="red"
            />
            <p className="prose-lead mt-6" data-reveal>
              {dict.systems.lead}
            </p>
            <p className="prose-lead mt-3" data-reveal>
              {dict.systems.sub}
            </p>

            <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8" data-reveal>
              {dict.systems.blocks.map((block) => (
                <div key={block.title}>
                  <p className="kicker mb-4">{block.title}</p>
                  <ul className="flex flex-col gap-2 border-t border-hairline pt-4">
                    {block.items.map((item) => (
                      <li key={item} className="text-sm text-fg">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Reveal>

          <div className="col-span-4 md:col-span-6 md:col-start-7">
            <ScrubWarm className="relative overflow-clip rounded-sm">
              <Img
                id="sections/interior"
                alt={dict.systems.imageAlt}
                sizes="(min-width: 768px) 48vw, 100vw"
                data-warm-photo
                className="h-[46svh] w-full object-cover md:h-[58svh]"
              />

              {/* A vignette and nothing else: it gives the frame a centre
                  without putting a second edge anywhere inside it. */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'radial-gradient(66% 70% at 52% 52%, transparent 44%, rgba(7, 11, 32, 0.24) 100%)',
                }}
              />

              <div
                aria-hidden
                data-warm-wash
                className="pointer-events-none absolute inset-0 opacity-0"
                style={{
                  background:
                    'radial-gradient(46% 52% at 50% 50%, rgba(255, 122, 60, 0.22) 0%, transparent 72%)',
                  mixBlendMode: 'screen',
                }}
              />
            </ScrubWarm>
          </div>
        </div>
      </div>
    </Section>
  );
}
