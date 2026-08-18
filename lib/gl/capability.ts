/**
 * Shared guards for the WebGL layer.
 *
 * Both canvases have to make the same two decisions — is a GPU actually
 * involved, and can this wait until after first paint — so the checks live here
 * rather than being written twice and drifting apart.
 */

/**
 * True when the browser is rasterising WebGL on the CPU.
 *
 * SwiftShader and llvmpipe identify themselves through the debug-renderer
 * extension. On those, a full-bleed fbm and ninety meshes are orders of
 * magnitude slower than the stills they replace — an audit forced onto
 * SwiftShader measured forty seconds of rasterisation — so the effects stand
 * down entirely and the photographs stay.
 */
export function isSoftwareRenderer(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
): boolean {
  const info = gl.getExtension('WEBGL_debug_renderer_info');
  const name = String(
    info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
  ).toLowerCase();
  return /swiftshader|llvmpipe|softwarerasterizer|microsoft basic render|software adapter/.test(
    name,
  );
}

/** Runs `fn` when the browser is next idle, or soon after if idle never comes. */
export function whenIdle(fn: () => void): () => void {
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(fn, { timeout: 1500 });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(fn, 300);
  return () => window.clearTimeout(id);
}
