import { GLMelt } from '@/components/gl/GLLayer';
import { Img } from '@/components/ui/Img';
import { Section } from '@/components/layout/Section';
import { Rule } from '@/components/ui/SectionHeading';
import { SplitHeading } from '@/components/ui/SplitHeading';
import type { Dictionary } from '@/content';

/**
 * The melt.
 *
 * The product is the studio render, masked and grounded with a contact shadow.
 *
 * It has been through three versions. The first put the still on an opaque
 * panel at `mix-blend-luminosity`, which produced both a hard bottom-right edge
 * and a pink cast, because luminosity blending takes the *backdrop's* hue and
 * the backdrop is a red melt. The second replaced it with the procedural WebGL
 * section, which was worse: at the top of the hero the shader's heat uniform is
 * at maximum, so the product read as pale pink plastic with no contrast against
 * the orange behind it. The render was the right answer all along; the melt
 * shader stays as the backdrop, which is the job it is actually good at.
 *
 * It also does not run off the right edge. `ml-auto` on a `w-auto` image
 * inside a fixed-height box pushed a tall render past the column, and the
 * section clipped it; the slot is now centred with its own safe inset.
 *
 * And the visitor can tell whose site this is inside a second: the wordmark is
 * part of the composition, at display scale, above the headline.
 *
 * Four text elements, no more: brand strip, headline, subtext, CTAs. The
 * "Uzbekistan, since 2015" eyebrow that used to sit above the wordmark was the
 * fifth, and a hero carrying both a brand strip and an eyebrow reads as a
 * stack of labels before it reads as a statement. That fact moved to the about
 * page, where it is the subject rather than a garnish.
 */
export function Hero({ dict }: { dict: Dictionary }) {
  return (
    <Section id="hero" labelledBy="hero-title" className="min-h-svh">
      {/* Fallback beneath the shader: the same molten ramp as thermal layer 0,
          so if WebGL never initialises nothing about the hero looks unfinished.
          It is not a section background — the thermal layer is still there
          underneath — it is the shader's own understudy. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20"
        style={{
          background:
            'radial-gradient(125% 100% at 50% -6%, var(--ember) 0%, #e8412e 16%, var(--red-500) 32%, #7d0b16 62%, #380810 100%)',
        }}
      />
      <GLMelt heatSelector="#hero" />

      <div className="frame relative flex min-h-svh flex-col justify-end pt-28 pb-14">
        <div className="grid-frame items-end gap-y-10">
          <div className="col-span-4 md:col-span-7">
            {/* The brand, at the size the brand deserves on a first screen.
                Read as one string by assistive tech; the visual break is
                typographic only. */}
            <p
              className="mb-6 leading-[0.86] font-extrabold tracking-[-0.03em] text-white uppercase"
              style={{ fontSize: 'clamp(2.25rem, 5.2vw, 5.5rem)' }}
            >
              <span className="sr-only">{dict.brand.full}</span>
              <span aria-hidden className="block">
                Calido
              </span>
              <span
                aria-hidden
                className="block font-bold tracking-[0.34em] text-white/70"
                style={{ fontSize: 'clamp(0.6875rem, 1.15vw, 1.25rem)' }}
              >
                Radiators
              </span>
            </p>

            <SplitHeading
              as="h1"
              id="hero-title"
              text={dict.hero.title}
              className="text-[clamp(1.5rem,2.6vw,2.5rem)] font-bold tracking-[-0.01em] text-white/95"
              start="top 95%"
              delay={0.2}
            />
            <Rule tone="light" className="mt-6" />
            <p className="prose-lead mt-6 text-white/85">{dict.hero.lead}</p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#range"
                className="inline-flex items-center gap-3 rounded-full bg-white px-7 py-4 text-[0.75rem] font-bold tracking-[0.1em] text-indigo-900 uppercase transition-colors hover:bg-indigo-100"
              >
                {dict.hero.cta}
                <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M8 2v12M3 9l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>

              <a
                href="#contact"
                className="inline-flex items-center rounded-full border border-white/35 px-6 py-4 text-[0.75rem] font-bold tracking-[0.1em] text-white uppercase transition-colors hover:border-white"
              >
                {dict.nav.cta}
              </a>
            </div>
          </div>

          {/*
            The studio render, not the procedural mesh.

            The WebGL section used to sit here and it was the wrong tool: at the
            top of the hero its heat uniform is at maximum, so the product read
            as pale pink plastic floating on an orange shader with no contrast
            against it. The real render is a photographed product in the brand
            metal finish, and it is the strongest asset this project has. The
            melt shader stays as the backdrop, which is what it is good at.
          */}
          <div className="relative col-span-4 flex h-[46svh] items-end justify-center pr-[2vw] md:col-span-5 md:h-[54svh]">
            <span aria-hidden className="pointer-events-none absolute inset-x-[8%] bottom-[3%] -z-10 h-[9%]"
              style={{
                background:
                  'radial-gradient(50% 50% at 50% 50%, rgba(6, 9, 26, 0.5) 0%, rgba(6, 9, 26, 0.2) 45%, transparent 78%)',
                filter: 'blur(6px)',
              }}
            />
            <Img
              id="hero/silhouette"
              alt={dict.hero.imageAlt}
              priority
              fetchPriority="high"
              sizes="(min-width: 1024px) 38vw, 88vw"
              className="feather-cut mx-auto h-full w-auto object-contain"
            />
          </div>
        </div>
      </div>
    </Section>
  );
}
