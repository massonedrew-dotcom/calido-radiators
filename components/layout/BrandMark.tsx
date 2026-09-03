import { Img } from '@/components/ui/Img';

/** One id, so header and footer share a single filter definition. */
const CONTOUR_ID = 'brand-contour';

/**
 * The logo, in its real colours, on every surface the site has.
 *
 * The site used to swap between two files: the full-colour mark on light
 * sections and an all-white knockout on dark ones. Both halves of that were
 * wrong. The knockout throws away the red arc, which is half the identity - the
 * mark stops being the Calido logo and becomes a white word. And the colour file
 * cannot simply be dropped on the dark ground either, because the wordmark is
 * indigo-700 and the surface is indigo-900: about 1.9:1, well under legible.
 *
 * The fix used to be a white plate behind the artwork. It worked, but it read as
 * exactly what it was - a sticker: a hard white rectangle with corners that
 * belong to nothing, sitting on top of the footer rather than in it.
 *
 * So the white is applied to the letterforms instead of to a box around them.
 * `feMorphology` dilates the artwork's own alpha by a couple of pixels, floods
 * that white, and lays it *under* the original: a contour that follows the
 * bowl of the C and the arc of the mark, so the ground still runs between the
 * letters. Radius is in CSS pixels of the rendered element, not of the source
 * file, so the outline stays the same visual weight at any size we place it.
 *
 * On light surfaces none of this is needed - the artwork was drawn for paper -
 * so `tone="light"` renders the file bare, with no plate and no contour.
 */
export function BrandMark({
  alt,
  priority = false,
  className = 'h-8 w-auto',
  tone = 'light',
}: {
  alt: string;
  priority?: boolean;
  /** Height of the artwork itself. */
  className?: string;
  /** `dark` adds the white contour that makes full colour survive indigo-900. */
  tone?: 'light' | 'dark';
}) {
  const art = (
    <Img
      id="brand/logo"
      alt={alt}
      priority={priority}
      sizes="200px"
      className={className}
      style={tone === 'dark' ? { filter: `url(#${CONTOUR_ID})` } : undefined}
    />
  );

  if (tone === 'light') return art;

  return (
    <span className="inline-flex items-center">
      <svg aria-hidden focusable="false" width="0" height="0" className="absolute">
        <defs>
          {/*
            The region has to be wider than the bbox or the dilation is clipped
            back to the artwork's own edges and the contour vanishes on the
            outermost glyphs - the R of RADIATORS and the registered mark.
          */}
          <filter
            id={CONTOUR_ID}
            x="-10%"
            y="-20%"
            width="120%"
            height="140%"
            colorInterpolationFilters="sRGB"
          >
            {/*
              1px, not more. The contour is set by the smallest thing in the
              artwork, not the largest: the RADIATORS line is barely three
              pixels tall at this size, and at 1.5 the dilation closes the gaps
              between its letters and turns the word into a white bar.
            */}
            <feMorphology in="SourceAlpha" operator="dilate" radius="1" result="spread" />
            <feFlood floodColor="#ffffff" result="white" />
            <feComposite in="white" in2="spread" operator="in" result="contour" />
            <feMerge>
              <feMergeNode in="contour" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>
      {art}
    </span>
  );
}
