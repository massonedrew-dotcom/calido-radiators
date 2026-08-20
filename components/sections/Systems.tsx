import { Section } from '@/components/layout/Section';
import { HeatPlumes } from '@/components/ui/HeatPlumes';
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
 * The fix is in two places. The crop moved (see `sections/interior` in
 * scripts/prep-assets.mjs): the window is gone and the radiator is the
 * compositional centre. And the product is now separated from the room in CSS
 * rather than hoped to separate on its own —
 *
 *   · the room plate is desaturated, softened and darkened, so it reads as
 *     context;
 *   · a second, tighter plate of the product itself is laid back over it at
 *     full contrast, feathered at the edges so it dissolves into the treated
 *     room rather than sitting in it as a rectangle;
 *   · a warm key pools on the product and convection rises off it, which is
 *     both the separation and the point of the section.
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
              {/* Room: pushed back. */}
              <Img
                id="sections/interior"
                alt={dict.systems.imageAlt}
                sizes="(min-width: 768px) 48vw, 100vw"
                data-warm-photo
                className="h-[46svh] w-full object-cover md:h-[58svh]"
                style={{ filter: 'saturate(0.28) blur(3px) brightness(0.62)' }}
              />

              {/* Vignette, so the eye is pulled to the middle before anything
                  else happens. */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'radial-gradient(58% 62% at 52% 52%, transparent 30%, rgba(7, 11, 32, 0.34) 72%, rgba(7, 11, 32, 0.62) 100%)',
                }}
              />

              {/* Product: brought forward, at full contrast, edges feathered so
                  the inset never reads as a pasted rectangle. */}
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <div className="relative w-[64%] max-w-[26rem]">
                  <span
                    aria-hidden
                    className="absolute -inset-[18%] -z-10"
                    style={{
                      background:
                        'radial-gradient(50% 50% at 50% 52%, rgba(255, 122, 60, 0.34) 0%, rgba(217, 18, 34, 0.16) 42%, transparent 76%)',
                    }}
                  />
                  <Img
                    id="sections/interior-product"
                    alt=""
                    aria-hidden
                    sizes="(min-width: 768px) 30vw, 62vw"
                    className="feather-edges h-auto w-full"
                    style={{ filter: 'saturate(1.05) contrast(1.08) brightness(1.06)' }}
                  />
                </div>
              </div>

              {/* Convection off the fins — the product visibly working. */}
              <HeatPlumes className="pointer-events-none absolute inset-x-[30%] top-[6%] bottom-[38%] h-[56%] w-[40%]" />

              <div
                aria-hidden
                data-warm-wash
                className="pointer-events-none absolute inset-0 opacity-0"
                style={{
                  background:
                    'radial-gradient(46% 52% at 50% 50%, rgba(255, 122, 60, 0.4) 0%, transparent 72%)',
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
