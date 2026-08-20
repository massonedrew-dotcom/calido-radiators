'use client';

import dynamic from 'next/dynamic';

import { useIsDesktop, useReducedMotion } from '@/lib/hooks';

/**
 * Loads the melt shader only where it will actually run.
 *
 * The canvas already bails out on phones and under reduced motion, but a static
 * import still ships ogl to every visitor - a chunk a phone downloads, parses,
 * and never uses. Splitting the import behind the same condition keeps it off
 * the mobile critical path entirely.
 *
 * This module used to export a second canvas, `GLStage`, which drew the casting
 * sequence and the exploded section. Both are SVG and photography now, so the
 * only WebGL left on the site is this hero backdrop - one full-screen fragment
 * shader with no geometry behind it.
 */
const MeltBackdrop = dynamic(() => import('./MeltBackdrop').then((m) => m.MeltBackdrop), {
  ssr: false,
});

function useGLEnabled() {
  const desktop = useIsDesktop();
  const reduced = useReducedMotion();
  return desktop === true && !reduced;
}

export function GLMelt({ heatSelector }: { heatSelector: string }) {
  return useGLEnabled() ? <MeltBackdrop heatSelector={heatSelector} /> : null;
}
