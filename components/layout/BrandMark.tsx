import { Img } from '@/components/ui/Img';

/**
 * The logo, in its real colours, on every surface the site has.
 *
 * The site used to swap between two files: the full-colour mark on light
 * sections and an all-white knockout on dark ones. Both halves of that were
 * wrong. The knockout throws away the red arc, which is half the identity - the
 * mark stops being the Calido logo and becomes a white word. And the colour file
 * cannot simply be used in its place, because the wordmark is indigo-700 and the
 * dark surface is indigo-900: about 1.9:1, well under legible.
 *
 * A white plate resolves both at once. It is the standard way a colour mark is
 * applied to a ground it was not drawn for, it keeps the registered artwork
 * untouched, and it makes the lockup identical on all six pages instead of
 * something that changes as you scroll. On the light pages the plate is a barely
 * perceptible chip against the paper; on the dark ones it is the only thing that
 * makes full colour possible at all.
 *
 * One component rather than two call sites, so the header and the footer cannot
 * drift apart again.
 */
export function BrandMark({
  alt,
  priority = false,
  className = 'h-8 w-auto',
  plateClassName = 'rounded-lg px-3.5 py-2.5',
}: {
  alt: string;
  priority?: boolean;
  /** Height of the artwork itself. */
  className?: string;
  /** Padding and radius of the plate around it. */
  plateClassName?: string;
}) {
  return (
    <span className={`inline-flex items-center bg-white ${plateClassName}`}>
      <Img
        id="brand/logo"
        alt={alt}
        priority={priority}
        sizes="180px"
        className={className}
      />
    </span>
  );
}
