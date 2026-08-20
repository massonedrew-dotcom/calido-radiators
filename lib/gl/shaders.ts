/**
 * Shaders for the hero melt backdrop.
 *
 * Lighting is synthesised from the brand palette rather than sampled from an
 * HDRI: a downloaded environment map would drag its own colour cast into every
 * highlight, and this product identity is indigo-on-white.
 */


export const MELT_VERT = /* glsl */ `#version 300 es
precision highp float;
in vec2 uv;
in vec2 position;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

/**
 * Domain-warped fbm over value noise. Value noise rather than simplex keeps the
 * inner loop to a handful of mixes, which is what holds 60fps at full-bleed on
 * an entry-level GPU.
 */
export const MELT_FRAG = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;

uniform float uTime;
uniform float uHeat;
uniform vec2 uResolution;

out vec4 fragColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    sum += amp * noise(p);
    p *= 2.02;
    amp *= 0.5;
  }
  return sum;
}

void main() {
  vec2 uv = vUv;
  vec2 p = uv * vec2(uResolution.x / uResolution.y, 1.0) * 2.6;
  float t = uTime * 0.045;

  vec2 q = vec2(fbm(p + t), fbm(p + vec2(3.7, 1.3) - t));
  vec2 r = vec2(fbm(p + 3.4 * q + vec2(1.7, 9.2) + t * 0.9),
                fbm(p + 3.4 * q + vec2(8.3, 2.8) - t * 0.7));
  float f = fbm(p + 3.0 * r);

  float body = clamp(f * 1.55 - 0.15, 0.0, 1.0);

  vec3 ember  = vec3(1.000, 0.416, 0.239);
  vec3 red    = vec3(0.855, 0.122, 0.149);
  vec3 indigo = vec3(0.118, 0.165, 0.388);

  // Hot: ember core through red. Cool: the same structure resolved to indigo.
  vec3 molten = mix(indigo, mix(red, ember, smoothstep(0.45, 0.95, body)), smoothstep(0.05, 0.7, body));
  vec3 cooled = mix(indigo * 0.85, vec3(0.169, 0.227, 0.533), body);
  vec3 col = mix(cooled, molten, uHeat);

  // Sparse sparks, only while the melt is still hot.
  float sparkCell = 46.0;
  vec2 sc = floor(p * sparkCell);
  float spark = step(0.9993, hash(sc + floor(uTime * 1.7)));
  col += ember * spark * uHeat * 1.4;

  // Vignette keeps the headline legible over the brightest part of the melt.
  float vig = smoothstep(1.25, 0.25, length(uv - 0.5) * 1.6);
  col *= mix(0.62, 1.0, vig);

  fragColor = vec4(col, 1.0);
}
`;
