'use client';

import dynamic from 'next/dynamic';

import { useIsDesktop, useReducedMotion } from '@/lib/hooks';

/**
 * Loads the WebGL layer only where it will actually run.
 *
 * Both canvases already bail out on phones and under reduced motion, but a
 * static import still ships ogl and the geometry builder to every visitor — a
 * 58 kB chunk that a phone downloads, parses, and never uses. Splitting the
 * import behind the same condition keeps it off the mobile critical path
 * entirely.
 */
const Stage = dynamic(() => import('./Stage').then((m) => m.Stage), { ssr: false });
const MeltBackdrop = dynamic(() => import('./MeltBackdrop').then((m) => m.MeltBackdrop), {
  ssr: false,
});

function useGLEnabled() {
  const desktop = useIsDesktop();
  const reduced = useReducedMotion();
  return desktop === true && !reduced;
}

export function GLStage() {
  return useGLEnabled() ? <Stage /> : null;
}

export function GLMelt({ heatSelector }: { heatSelector: string }) {
  return useGLEnabled() ? <MeltBackdrop heatSelector={heatSelector} /> : null;
}
