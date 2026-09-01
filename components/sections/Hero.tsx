import Link from 'next/link';

import { Img } from '@/components/ui/Img';
import { Section } from '@/components/layout/Section';
import { Plate } from '@/components/ui/Plate';
import { SplitHeading } from '@/components/ui/SplitHeading';
import type { Dictionary } from '@/content';
import { pagePath } from '@/lib/pages';

/**
 * The first screen. White.
 *
 * The previous version was the thing that went wrong: a full-bleed molten
 * gradient with a WebGL fragment shader on top of it, white type over the whole
 * lot, and a studio render of the product floating in the middle. Three
 * problems, and only the third is about taste.
 *
 * · A red first screen makes red the site's background colour rather than its
 *   accent, and once the visitor has read a whole viewport of it there is
 *   nothing left for a CTA to be.
 * · The shader was four octaves of domain-warped noise across the viewport —
 *   the single most expensive thing on the page, shipped as its own chunk, for
 *   a texture the visitor scrolls past in two seconds.
 * · A dark product render on a dark gradient has nowhere to sit. The reason the
 *   image needed a mask, a contact shadow and an edge feather was that it was
 *   fighting its own background.
 *
 * What replaces it is the arrangement the source template uses and the reason
 * that template works: white field, one colour plate carrying the eyebrow, the
 * headline in ink at display scale, and the product photographed against the
 * white it was lit for. The red is still here — it is the CTA and the rule
 * under the wordmark, which is 3% of the screen instead of 100% of it.
 */
export function Hero({ dict }: { dict: Dictionary }) {
  const locale = dict.locale === 'en' ? 'en' : 'ru';

  return (
    <Section id="hero" labelledBy="hero-title">
      <div className="frame grid-frame items-center gap-y-12 pt-14 pb-16 lg:pt-20 lg:pb-24">
        <div className="col-span-4 md:col-span-6">
          {/* The eyebrow is the plate — "Uzbekistan, since 2015" as a solid
              block of indigo rather than as small grey type. */}
          <Plate tone="indigo" as="p" className="inline-block px-4 py-2">
            <span className="text-[0.6875rem] font-bold tracking-[0.18em] text-white uppercase">
              {dict.hero.kicker}
            </span>
          </Plate>

          {/* The brand, at the size the brand deserves on a first screen. Read
              as one string by assistive tech; the visual break is typographic. */}
          <p
            className="mt-8 leading-[0.86] font-extrabold tracking-[-0.03em] text-ink uppercase"
            style={{ fontSize: 'clamp(2.5rem, 5.6vw, 5.5rem)' }}
          >
            <span className="sr-only">{dict.brand.full}</span>
            <span aria-hidden className="block">
              Calido
            </span>
            <span
              aria-hidden
              className="block font-bold tracking-[0.34em] text-slate"
              style={{ fontSize: 'clamp(0.6875rem, 1.15vw, 1.25rem)' }}
            >
              Radiators
            </span>
          </p>

          <span aria-hidden className="mt-7 block h-1.5 w-24 bg-red-500" />

          <SplitHeading
            as="h1"
            id="hero-title"
            text={dict.hero.title}
            className="mt-7 text-[clamp(1.5rem,2.6vw,2.5rem)] font-bold tracking-[-0.01em] text-indigo-700"
            start="top 95%"
            delay={0.2}
          />

          <p className="prose-lead mt-5">{dict.hero.lead}</p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            {/*
              Both destinations are pages, not anchors. They used to be
              `#range` and `#contact`, which were real section ids while the
              whole site was one scroll and have pointed at nothing on the home
              page since it split — "Смотреть модельный ряд" has to reach
              /models, and it cannot do that with a hash.
            */}
            <Link
              href={pagePath('models', locale)}
              className="inline-flex items-center justify-center gap-3 bg-red-500 px-8 py-4 text-[0.75rem] font-bold tracking-[0.1em] text-white uppercase transition-colors hover:bg-red-700"
            >
              {dict.hero.cta}
              <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>

            <Link
              href={pagePath('contact', locale)}
              className="inline-flex items-center justify-center border border-indigo-700 px-7 py-4 text-[0.75rem] font-bold tracking-[0.1em] text-indigo-700 uppercase transition-colors hover:bg-indigo-700 hover:text-white"
            >
              {dict.nav.cta}
            </Link>
          </div>
        </div>

        {/*
          The render, on white, with no mask on it.

          Every treatment the old hero needed here — the radial feather, the
          contact shadow, the `feather-cut` ramps — existed to dissolve a studio
          background into a red gradient. The studio background *is* white, so
          the correct amount of compositing is none, and the product now has a
          real edge instead of a fading one.

          The paper plate behind it is what stops a white-on-white product from
          reading as a floating cutout: it gives the image a box to sit in, set
          off-centre so the render breaks its top edge.
        */}
        <div className="relative col-span-4 md:col-span-6">
          {/* Offset down and to the right, so it is a rectangle the product
              sits across rather than a frame around it. The render's
              background is genuinely transparent — checked, not assumed — so
              the plate reads through the gaps between the fins. */}
          <Plate tone="paper" className="absolute inset-y-[12%] right-0 left-[14%]" />
          <Plate tone="red" className="absolute right-0 bottom-[12%] h-1.5 w-[38%]" />
          <Img
            id="hero/silhouette"
            alt={dict.hero.imageAlt}
            priority
            fetchPriority="high"
            sizes="(min-width: 768px) 46vw, 88vw"
            className="relative mx-auto h-auto w-full max-w-[32rem] object-contain"
          />
        </div>
      </div>
    </Section>
  );
}
