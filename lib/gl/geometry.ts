import { Box, Cylinder, Geometry, Transform, type OGLRenderingContext } from 'ogl';

/**
 * Procedural radiator section.
 *
 * There is no CAD or GLTF for this product, so the geometry is reconstructed
 * from the studio photographs and driven by the *real* factory dimensions in
 * content/models.ts. That makes the 3D dimensionally honest per model — a
 * stock asset never could be — and costs nothing to download.
 *
 * Everything is authored in millimetres and scaled to pixels at mount time.
 */

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);

/**
 * Rounded box, built by pushing a subdivided cube's vertices out from their
 * clamped inner point. Sharp-edged boxes read as CAD screenshots; aluminium
 * castings have chamfers, and the highlight running along them is most of what
 * sells the material.
 */
export function roundedBox(
  gl: OGLRenderingContext,
  {
    width,
    height,
    depth,
    radius,
    segments = 4,
  }: { width: number; height: number; depth: number; radius: number; segments?: number },
): Geometry {
  const r = Math.min(radius, width / 2, height / 2, depth / 2);
  const src = new Box(gl, {
    width,
    height,
    depth,
    widthSegments: segments,
    heightSegments: segments,
    depthSegments: segments,
  });

  const pos = src.attributes.position!.data as Float32Array;
  const nrm = new Float32Array(pos.length);

  const ex = width / 2 - r;
  const ey = height / 2 - r;
  const ez = depth / 2 - r;

  for (let i = 0; i < pos.length; i += 3) {
    const ix = clamp(pos[i]!, -ex, ex);
    const iy = clamp(pos[i + 1]!, -ey, ey);
    const iz = clamp(pos[i + 2]!, -ez, ez);

    let dx = pos[i]! - ix;
    let dy = pos[i + 1]! - iy;
    let dz = pos[i + 2]! - iz;
    const len = Math.hypot(dx, dy, dz) || 1;
    dx /= len;
    dy /= len;
    dz /= len;

    pos[i] = ix + dx * r;
    pos[i + 1] = iy + dy * r;
    pos[i + 2] = iz + dz * r;
    nrm[i] = dx;
    nrm[i + 1] = dy;
    nrm[i + 2] = dz;
  }

  return new Geometry(gl, {
    position: { size: 3, data: pos },
    normal: { size: 3, data: nrm },
    uv: src.attributes.uv!,
    index: src.attributes.index!,
  });
}

/** Named parts, so the anatomy scene can pull them apart individually. */
export type PartName =
  | 'face'
  | 'wall'
  | 'rib'
  | 'collarTop'
  | 'collarBottom'
  | 'portTop'
  | 'portBottom';

export interface SectionPart {
  readonly name: PartName;
  readonly node: Transform;
  readonly geometry: Geometry;
  /** Direction this part travels in an exploded view, in mm. */
  readonly explode: readonly [number, number, number];
  /** Steel manifolds are a different material from the cast aluminium body. */
  readonly steel: boolean;
}

export interface SectionDims {
  /** Section width in mm (the 80 in 80 x 80 x 575). */
  readonly width: number;
  /** Section depth in mm. */
  readonly depth: number;
  /** Overall section height in mm. */
  readonly height: number;
}

/**
 * Assembles one section: a smooth front face, the two side walls that form the
 * rear channel, five cross ribs inside it, and the horizontal manifold collars
 * with their threaded ports.
 *
 * Sections butt together at exactly `dims.width`, so an assembly's collars line
 * up into one continuous manifold — the same way the real product goes together.
 */
export function buildSection(gl: OGLRenderingContext, dims: SectionDims): SectionPart[] {
  const { width: W, depth: D, height: H } = dims;
  const parts: SectionPart[] = [];

  const collarR = Math.min(W, D) * 0.2;
  const collarY = H / 2 - collarR - 6;
  const bodyH = H - collarR * 2.5;

  const push = (
    name: PartName,
    geometry: Geometry,
    pos: [number, number, number],
    explode: [number, number, number],
    steel = false,
    rotZ = 0,
  ) => {
    const node = new Transform();
    node.position.set(pos[0], pos[1], pos[2]);
    if (rotZ) node.rotation.z = rotZ;
    parts.push({ name, node, geometry, explode, steel });
  };

  // Front face: the visible plate, slightly proud of the body.
  push(
    'face',
    roundedBox(gl, { width: W * 0.9, height: bodyH, depth: D * 0.13, radius: 3.5, segments: 5 }),
    [0, -collarR * 0.4, D * 0.4],
    [0, 0, 50],
  );

  // Side walls: the U-channel behind the face that the ribs span.
  for (const s of [-1, 1] as const) {
    push(
      'wall',
      roundedBox(gl, { width: W * 0.1, height: bodyH, depth: D * 0.56, radius: 2, segments: 3 }),
      [s * W * 0.4, -collarR * 0.4, -D * 0.03],
      [s * 28, 0, -12],
    );
  }

  // Cross ribs inside the channel — the lattice visible in the product shots.
  const RIBS = 5;
  for (let i = 0; i < RIBS; i++) {
    const f = i / (RIBS - 1);
    push(
      'rib',
      roundedBox(gl, { width: W * 0.72, height: H * 0.032, depth: D * 0.46, radius: 1.5, segments: 3 }),
      [0, (0.5 - f) * bodyH * 0.78 - collarR * 0.4, -D * 0.06],
      [0, 0, -34 - i * 6],
    );
  }

  // Manifold collars run across the assembly axis, hence the Z rotation.
  const collar = new Cylinder(gl, {
    radiusTop: collarR,
    radiusBottom: collarR,
    height: W,
    radialSegments: 40,
    heightSegments: 1,
  });
  const port = new Cylinder(gl, {
    radiusTop: collarR * 0.62,
    radiusBottom: collarR * 0.62,
    height: W * 1.18,
    radialSegments: 32,
    heightSegments: 1,
  });

  push('collarTop', collar, [0, collarY, -D * 0.02], [0, 78, 0], true, Math.PI / 2);
  push('collarBottom', collar, [0, -collarY, -D * 0.02], [0, -78, 0], true, Math.PI / 2);
  push('portTop', port, [0, collarY, -D * 0.02], [0, 78, 0], true, Math.PI / 2);
  push('portBottom', port, [0, -collarY, -D * 0.02], [0, -78, 0], true, Math.PI / 2);

  return parts;
}
