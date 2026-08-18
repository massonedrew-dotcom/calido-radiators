'use client';

import { Camera, Mesh, Program, Renderer, Transform, Vec3, type OGLRenderingContext } from 'ogl';
import { useEffect, useRef } from 'react';

import { MODELS } from '@/content/models';
import { isSoftwareRenderer, whenIdle } from '@/lib/gl/capability';
import { buildSection, type SectionDims, type SectionPart } from '@/lib/gl/geometry';
import { SECTION_FRAG, SECTION_VERT } from '@/lib/gl/shaders';
import { gsap } from '@/lib/gsap';
import { useIsDesktop, useReducedMotion } from '@/lib/hooks';

/**
 * One fixed, DOM-synced WebGL canvas for the whole page.
 *
 * Rather than a canvas per section — each of which burns a GL context, and
 * browsers cap those at around sixteen — a single transparent canvas is pinned
 * to the viewport, with the camera set so one world unit equals one CSS pixel
 * at z = 0. Each 3D slot is an ordinary DOM element carrying `data-gl-slot`;
 * every frame the stage reads its rect and parks the mesh exactly over it.
 *
 * The slot element keeps a still photograph inside it. That image is the
 * fallback mobile and reduced-motion visitors get, and it is also what shows
 * if WebGL fails to initialise — the stage only hides it after a context is
 * live.
 */

/** Reference geometry: CLASSIC, 80 x 80 x 575 mm. */
const DIMS = { width: 80, depth: 80, height: 575 } as const;

/** Camera distance in px. Far enough that perspective stays gentle. */
const CAM_Z = 1600;

type SceneKind = 'hero' | 'cast' | 'anatomy' | 'lineup';

/**
 * How many sections each scene assembles. A lone section is 80 x 575 mm —
 * roughly 1:7 — which reads as a blade rather than a radiator. Sections butt
 * together at exactly their width, so an assembly gives both the right silhouette
 * and a continuous manifold, matching every product photograph.
 */
const SECTION_COUNT: Record<SceneKind, number> = {
  hero: 6,
  cast: 5,
  // Anatomy stays a single section: that is what the catalogue spread shows,
  // and the narrow centre column between the two callout stacks suits it.
  anatomy: 1,
  // Per model in the size comparison.
  lineup: 2,
};

/** How much the assembly shrinks at full explode, so it stays inside its slot. */
const EXPLODE_SHRINK = 0.18;

/**
 * Gap between models in the lineup, in mm.
 *
 * The row is fitted by width, so every millimetre of gap is paid for by every
 * model getting smaller. Six models rather than five is already a fifth more
 * width, hence the tighter spacing — still wide enough to read as six separate
 * assemblies rather than one continuous manifold.
 */
const LINEUP_GAP = 36;

/**
 * Tallest section in the range. Every model in the lineup is scaled against
 * this one rather than fitted to its own box, which is the entire point: the
 * 425 mm CLASSIC 350 has to actually look shorter than the 586 mm ELEGANT.
 */
const TALLEST = Math.max(...MODELS.map((m) => m.section.height));

interface SlotPart {
  readonly node: Transform;
  /** Rest position in mm, captured at build time. */
  readonly rest: readonly [number, number, number];
  /** Direction and distance this part travels when exploded, in mm. */
  readonly explode: readonly [number, number, number];
}

interface SlotGroup {
  readonly node: Transform;
  /** Rest X of this section within the assembly, in mm. */
  readonly restX: number;
  readonly parts: readonly SlotPart[];
}

interface Slot {
  readonly el: HTMLElement;
  readonly kind: SceneKind;
  readonly root: Transform;
  readonly groups: readonly SlotGroup[];
  readonly programs: readonly Program[];
  /** Assembly width in mm, for the fit calculation. */
  readonly width: number;
  /** Height in mm the fit is measured against. */
  readonly refHeight: number;
  /** Lineup models stand on a shared floor rather than a shared centre. */
  readonly baseline: boolean;
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Smoothstepped progress of the `a`..`b` window within a 0..1 range. */
function span(p: number, a: number, b: number) {
  const t = clamp01((p - a) / (b - a));
  return t * t * (3 - 2 * t);
}

function makeProgram(gl: OGLRenderingContext, base: [number, number, number], steel: boolean) {
  return new Program(gl, {
    vertex: SECTION_VERT,
    fragment: SECTION_FRAG,
    uniforms: {
      uBase: { value: new Vec3(...base) },
      uFill: { value: new Vec3(0.894, 0.910, 0.969) }, // indigo-100 bounce
      uRim: { value: new Vec3(0.169, 0.227, 0.533) }, // indigo-700 rim
      uHeat: { value: 0 },
      uAlpha: { value: 1 },
      uPour: { value: 1 },
      uSpan: { value: 200 },
      uCenterY: { value: 0 },
      uSteel: { value: steel ? 1 : 0 },
    },
  });
}

function setUniform(programs: readonly Program[], name: string, value: number) {
  for (const p of programs) {
    const u = (p.uniforms as Record<string, { value: number } | undefined>)[name];
    if (u) u.value = value;
  }
}

/**
 * Per-scene choreography, driven entirely by the slot's own scroll progress.
 * Returns the explode amount so the caller can shrink the fit to match.
 *
 * Rotation ranges are kept modest and roughly centred: swinging far past the
 * key light leaves the front faces in shadow, which reads as the model going
 * dark rather than turning.
 */
function applyScene(slot: Slot, p: number, t: number): number {
  const { programs, root, groups, kind } = slot;

  let explode = 0;

  if (kind === 'hero') {
    // The casting cools as the hero scrolls away.
    setUniform(programs, 'uPour', 1);
    setUniform(programs, 'uHeat', 1 - span(p, 0.12, 0.62));
    root.rotation.y = -0.42 + p * 0.72 + Math.sin(t * 0.2) * 0.04;
    root.rotation.x = 0.05;
  } else if (kind === 'cast') {
    // Empty die, metal rising through it under pressure, finished section.
    const pour = span(p, 0.18, 0.62);
    setUniform(programs, 'uPour', pour);
    setUniform(programs, 'uHeat', (1 - span(p, 0.5, 0.9)) * span(p, 0.1, 0.32));
    root.rotation.y = -0.3 + p * 0.52;
    root.rotation.x = 0.04;
  } else if (kind === 'anatomy') {
    // The section comes apart so the steel manifolds separate from the cast
    // aluminium body.
    setUniform(programs, 'uPour', 1);
    setUniform(programs, 'uHeat', 0);
    explode = span(p, 0.22, 0.78);
    root.rotation.y = -0.5 + p * 0.34;
    root.rotation.x = 0.05;
  } else {
    // Lineup: the whole range at true relative scale, turning slowly.
    setUniform(programs, 'uPour', 1);
    setUniform(programs, 'uHeat', 0);
    root.rotation.y = -0.36 + p * 0.5;
    root.rotation.x = 0.04;
  }

  for (const group of groups) {
    group.node.position.x = group.restX;
    for (const part of group.parts) {
      part.node.position.set(
        part.rest[0] + part.explode[0] * explode,
        part.rest[1] + part.explode[1] * explode,
        part.rest[2] + part.explode[2] * explode,
      );
    }
  }

  return explode;
}

interface Placement {
  readonly dims: SectionDims;
  readonly x: number;
  readonly y: number;
}

/**
 * Where each section stands for a given scene, in millimetres.
 *
 * The lineup lays the models out left to right and drops each one onto a
 * shared floor, so the comparison is read off the tops — exactly how the
 * factory's own lineup photograph is composed.
 */
function planScene(kind: SceneKind): {
  list: Placement[];
  width: number;
  refHeight: number;
  baseline: boolean;
} {
  const count = SECTION_COUNT[kind];

  if (kind === 'lineup') {
    const width =
      MODELS.reduce((sum, m) => sum + count * m.section.width, 0) +
      LINEUP_GAP * (MODELS.length - 1);

    const list: Placement[] = [];
    let cursor = -width / 2;

    for (const model of MODELS) {
      const { width: w, height: h } = model.section;
      const assemblyW = count * w;
      const centre = cursor + assemblyW / 2;
      for (let i = 0; i < count; i++) {
        list.push({
          dims: model.section,
          x: centre + (i - (count - 1) / 2) * w,
          // Sit on the floor instead of on the centre line.
          y: (h - TALLEST) / 2,
        });
      }
      cursor += assemblyW + LINEUP_GAP;
    }

    return { list, width, refHeight: TALLEST, baseline: true };
  }

  const list = Array.from({ length: count }, (_, i) => ({
    dims: DIMS as SectionDims,
    x: (i - (count - 1) / 2) * DIMS.width,
    y: 0,
  }));

  return { list, width: count * DIMS.width, refHeight: DIMS.height, baseline: false };
}

export function Stage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const desktop = useIsDesktop();
  const reduced = useReducedMotion();

  useEffect(() => {
    // WebGL is desktop-only by design: phones keep the still fallbacks.
    if (!desktop || reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let dispose: (() => void) | undefined;

    // Building forty-five geometries and compiling the programs is a few
    // hundred milliseconds of synchronous work. Held until the browser is idle
    // so it lands after first paint rather than inside it.
    const cancelIdle = whenIdle(() => {
      dispose = init();
    });

    return () => {
      cancelIdle();
      dispose?.();
    };

    function init() {
      let renderer: Renderer;
      try {
        renderer = new Renderer({
          canvas: canvas!,
          alpha: true,
          antialias: true,
          dpr: Math.min(window.devicePixelRatio, 1.75),
          powerPreference: 'high-performance',
        });
      } catch {
        return; // No WebGL — the fallback photographs simply stay visible.
      }

      const gl = renderer.gl;
      if (isSoftwareRenderer(gl)) {
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return;
      }
      gl.clearColor(0, 0, 0, 0);

    const camera = new Camera(gl, { near: 1, far: CAM_Z * 3 });
    camera.position.z = CAM_Z;

    const scene = new Transform();

    // Geometry is cached per envelope, so the range costs one part set per
    // distinct envelope rather than one per section drawn.
    const cache = new Map<string, SectionPart[]>();
    const templateFor = (dims: SectionDims) => {
      const key = `${dims.width}x${dims.depth}x${dims.height}`;
      let parts = cache.get(key);
      if (!parts) {
        parts = buildSection(gl, dims);
        cache.set(key, parts);
      }
      return parts;
    };

    const slots: Slot[] = [];
    document.querySelectorAll<HTMLElement>('[data-gl-slot]').forEach((el) => {
      const kind = el.dataset.glSlot as SceneKind;
      if (!(kind in SECTION_COUNT)) return;

      const root = new Transform();
      root.setParent(scene);

      const alloy = makeProgram(gl, [0.62, 0.65, 0.72], false);
      const steel = makeProgram(gl, [0.74, 0.76, 0.8], true);

      const plan = planScene(kind);
      const groups: SlotGroup[] = plan.list.map((place) => {
        const groupNode = new Transform();
        groupNode.position.set(place.x, place.y, 0);
        groupNode.setParent(root);

        const parts: SlotPart[] = templateFor(place.dims).map((part) => {
          const node = new Transform();
          node.position.copy(part.node.position);
          node.rotation.copy(part.node.rotation);
          node.setParent(groupNode);

          const mesh = new Mesh(gl, {
            geometry: part.geometry,
            program: part.steel ? steel : alloy,
          });
          mesh.setParent(node);

          return {
            node,
            rest: [part.node.position.x, part.node.position.y, part.node.position.z] as const,
            explode: part.explode,
          };
        });

        return { node: groupNode, restX: place.x, parts };
      });

      slots.push({
        el,
        kind,
        root,
        groups,
        programs: [alloy, steel],
        width: plan.width,
        refHeight: plan.refHeight,
        baseline: plan.baseline,
      });
    });

    if (slots.length === 0) return;
    document.documentElement.dataset.gl = 'on';

    let vw = window.innerWidth;
    let vh = window.innerHeight;

    const resize = () => {
      vw = window.innerWidth;
      vh = window.innerHeight;
      renderer.setSize(vw, vh);
      camera.fov = (2 * Math.atan(vh / 2 / CAM_Z) * 180) / Math.PI;
      camera.perspective({ aspect: vw / vh });
    };
    resize();
    window.addEventListener('resize', resize);

    const tick = (time: number) => {
      const t = time / 1000;
      let anyVisible = false;

      for (const slot of slots) {
        const rect = slot.el.getBoundingClientRect();
        const visible = rect.bottom > -200 && rect.top < vh + 200 && rect.width > 0;
        slot.root.visible = visible;
        if (!visible) continue;
        anyVisible = true;

        // Normally 0 as the slot enters from the bottom and 1 as it leaves past
        // the top. A pinned section freezes its own rect, so those sections
        // publish their ScrollTrigger progress instead and it wins.
        const published = slot.el.dataset.glProgress;
        const p =
          published !== undefined && published !== ''
            ? clamp01(parseFloat(published))
            : clamp01((vh - rect.top) / (vh + rect.height));

        // Choreograph first: the explode amount decides how much the assembly
        // has to shrink to stay inside its column.
        const explode = applyScene(slot, p, t);

        // Fit by whichever axis binds first, with headroom for the perspective
        // magnification on the near edge of a rotated assembly.
        const fit =
          Math.min((rect.height * 0.9) / slot.refHeight, (rect.width * 0.88) / slot.width) *
          (1 - EXPLODE_SHRINK * explode);

        slot.root.scale.set(fit, fit, fit);
        slot.root.position.x = rect.left + rect.width / 2 - vw / 2;
        slot.root.position.y = slot.baseline
          ? // Stand the models on the bottom edge of the slot so the height
            // difference between them is read off the tops.
            -(rect.bottom - vh / 2) + (slot.refHeight / 2) * fit
          : -(rect.top + rect.height / 2 - vh / 2);

        setUniform(slot.programs, 'uSpan', (slot.refHeight / 2) * fit);
        setUniform(slot.programs, 'uCenterY', slot.root.position.y);
      }

      // Nothing on screen means nothing to draw — the loop idles for free.
      if (anyVisible) renderer.render({ scene, camera });
    };

    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener('resize', resize);
      delete document.documentElement.dataset.gl;
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
    }
  }, [desktop, reduced]);

  if (!desktop || reduced) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-30 h-full w-full"
    />
  );
}
