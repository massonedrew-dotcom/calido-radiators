import { GLMelt } from '@/components/gl/GLLayer';
import { Section } from '@/components/layout/Section';
import { Img } from '@/components/ui/Img';
import { Rule } from '@/components/ui/SectionHeading';
import { SplitHeading } from '@/components/ui/SplitHeading';
import type { Dictionary } from '@/content';

/**
 * 01 — Melt.
 *
 * Step 3 replaces the static gradient with the WebGL melt shader and splits the
 * headline into letters. The markup below is the reduced-motion / no-WebGL
 * fallback that will stay in place for mobile and for `prefers-reduced-motion`.
 */
export function Hero({ dict }: { dict: Dictionary }) {
  return (
    <Section id="hero" tone="dark" labelledBy="hero-title" className="min-h-svh">
      {/* Fallback first, shader on top of it once a context is live. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20"
        style={{
          background:
            'radial-gradient(120% 90% at 50% 8%, #FF6A3D 0%, var(--red-600) 26%, var(--indigo-900) 72%)',
        }}
      />
      <GLMelt heatSelector="#hero" />

      <div className="frame relative flex min-h-svh flex-col justify-end pt-32 pb-16">
        <div className="grid-frame items-end gap-y-12">
          <div className="col-span-4 md:col-span-7">
            <p className="kicker mb-6 text-white/70">{dict.hero.kicker}</p>
            <SplitHeading
              as="h1"
              id="hero-title"
              text={dict.hero.title}
              className="display text-white"
              start="top 95%"
              delay={0.2}
            />
            <Rule tone="light" className="mt-8" />
            <p className="prose-lead mt-8 text-white/85">{dict.hero.lead}</p>
            <p className="prose-lead mt-4 text-white/70">{dict.hero.sub}</p>

            <a
              href="#range"
              className="mt-10 inline-flex items-center gap-3 rounded-full bg-white px-7 py-4 text-[0.75rem] font-bold tracking-[0.1em] text-indigo-900 uppercase transition-colors hover:bg-indigo-100"
            >
              {dict.hero.cta}
              <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M8 2v12M3 9l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>

          <div
            data-gl-slot="hero"
            className="col-span-4 flex h-[52vh] items-end justify-center md:col-span-5"
          >
            {/* Priority after all. On desktop the WebGL stage covers this
                within a second, so preloading looked wasteful — but on mobile
                there is no stage and this image *is* the LCP element, and
                without the preload it landed at 4.5s. 23 kB is a cheap
                insurance premium. */}
            <Img
              id="hero/silhouette"
              alt={dict.hero.imageAlt}
              priority
              sizes="(min-width: 1024px) 40vw, 90vw"
              data-gl-fallback
              className="ml-auto h-full w-auto object-contain opacity-90 mix-blend-luminosity"
            />
          </div>
        </div>
      </div>
    </Section>
  );
}
