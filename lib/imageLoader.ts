import { ASSETS } from '@/content/assets.generated';

/**
 * Custom next/image loader for a static export.
 *
 * There is no image optimiser route on a file host, so `images.unoptimized`
 * used to be the only option. That flag does more than disable resizing though:
 * it also stops Next emitting a `srcset` at all, so a phone rendering the hero
 * at ~340 CSS px was downloading the 900px master. The fix is to pre-render the
 * ladder at build time (scripts/prep-assets.mjs) and point Next at it through a
 * loader, which restores `srcset` without needing a server.
 *
 * Widths are looked up per asset rather than assumed: small sources like the
 * colourway swatches have no variants, and requesting `@420` for a file that is
 * 312px wide would 404.
 */

interface Entry {
  readonly path: string;
  readonly widths: readonly number[];
}

/** `/models/bravo.webp` -> its emitted widths. Longest paths first, so a
 *  lookup cannot match a shorter path that happens to be a suffix. */
const ENTRIES: readonly Entry[] = Object.values(ASSETS)
  .map((a) => ({ path: a.src as string, widths: a.widths }))
  .sort((a, b) => b.path.length - a.path.length);

export default function imageLoader({ src, width }: { src: string; width: number }): string {
  // `src` arrives with the basePath already applied, so match on the tail.
  const entry = ENTRIES.find((e) => src.endsWith(e.path));

  // Anything outside the manifest (nothing today, but a one-off image added
  // later would land here) is served exactly as authored.
  if (!entry) return src;

  const master = entry.widths[entry.widths.length - 1]!;
  // Smallest emitted variant that still covers the request, else the master.
  const pick = entry.widths.find((w) => w >= width) ?? master;
  if (pick === master) return src;

  const prefix = src.slice(0, src.length - entry.path.length);
  return `${prefix}${entry.path.replace(/\.webp$/, `@${pick}.webp`)}`;
}
