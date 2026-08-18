'use client';

import { Mesh, Program, Renderer, Triangle, Vec2 } from 'ogl';
import { useEffect, useRef } from 'react';

import { isSoftwareRenderer, whenIdle } from '@/lib/gl/capability';
import { MELT_FRAG, MELT_VERT } from '@/lib/gl/shaders';
import { gsap } from '@/lib/gsap';
import { useIsDesktop, useReducedMotion } from '@/lib/hooks';

/**
 * The hero melt: a full-bleed fragment shader that has to sit *behind* the
 * headline, which is why it gets its own canvas rather than riding on the
 * shared Stage — that one is composited above the content so its meshes can
 * land in empty layout columns.
 *
 * A CSS gradient of the same three colours sits underneath as the fallback, so
 * the hero never flashes empty while the context spins up, and it is what stays
 * on phones, under reduced motion, and on machines without a real GPU.
 */
export function MeltBackdrop({ heatSelector }: { heatSelector: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const desktop = useIsDesktop();
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!desktop || reduced) return;
    const canvas = canvasRef.current;
    const host = document.querySelector<HTMLElement>(heatSelector);
    if (!canvas || !host) return;

    let dispose: (() => void) | undefined;
    const cancelIdle = whenIdle(() => {
      dispose = init(canvas, host);
    });

    return () => {
      cancelIdle();
      dispose?.();
    };
  }, [desktop, reduced, heatSelector]);

  if (!desktop || reduced) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 -z-10 h-full w-full opacity-0 transition-opacity duration-700 data-[ready]:opacity-100"
    />
  );
}

function init(canvas: HTMLCanvasElement, host: HTMLElement) {
  let renderer: Renderer;
  try {
    renderer = new Renderer({
      canvas,
      alpha: false,
      antialias: false,
      // Four octaves of domain-warped noise over the whole viewport is the
      // single most expensive thing on the page. Noise is smooth, so rendering
      // below device resolution and letting the compositor upscale costs
      // nothing visually and roughly halves the fill rate.
      dpr: 1,
    });
  } catch {
    return;
  }

  const gl = renderer.gl;
  if (isSoftwareRenderer(gl)) {
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return;
  }

  const program = new Program(gl, {
    vertex: MELT_VERT,
    fragment: MELT_FRAG,
    uniforms: {
      uTime: { value: 0 },
      uHeat: { value: 1 },
      uResolution: { value: new Vec2(1, 1) },
    },
  });
  const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

  const resize = () => {
    const rect = host.getBoundingClientRect();
    renderer.setSize(rect.width, rect.height);
    (program.uniforms.uResolution as { value: Vec2 }).value.set(rect.width, rect.height);
  };
  resize();
  window.addEventListener('resize', resize);
  canvas.dataset.ready = 'true';

  const tick = (time: number) => {
    const rect = host.getBoundingClientRect();
    // Off screen: stop burning fill rate on a shader nobody can see.
    if (rect.bottom <= 0) return;

    // Cools as the hero scrolls away, in step with the section in the Stage.
    const p = Math.min(Math.max(-rect.top / rect.height, 0), 1);
    (program.uniforms.uHeat as { value: number }).value = 1 - p * p;
    (program.uniforms.uTime as { value: number }).value = time / 1000;
    renderer.render({ scene: mesh });
  };

  gsap.ticker.add(tick);

  return () => {
    gsap.ticker.remove(tick);
    window.removeEventListener('resize', resize);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  };
}
