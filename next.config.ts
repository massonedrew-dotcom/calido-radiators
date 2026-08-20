import type { NextConfig } from 'next';

/**
 * GitHub Pages serves a project site from /<repo>, never from the root, and it
 * is a plain file host with no Node process behind it. Both facts have to be
 * reflected in the build — but only in *that* build. The prefix is read from the
 * environment rather than hardcoded so `npm run dev` keeps serving on
 * localhost:3000/ instead of forcing the repository name into every local URL,
 * and so moving to a custom domain later is one variable, not a code change.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const nextConfig: NextConfig = {
  // Emits out/ as pre-rendered HTML. Every route in this app is already static,
  // so nothing is lost.
  output: 'export',
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
  // Pages resolves a bare /en against /en/index.html; without this the export
  // would write out/en.html, reachable only at /en.html.
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    /**
     * The optimiser is a server route and there is no server, so the responsive
     * ladder is pre-rendered at build time by scripts/prep-assets.mjs and this
     * loader points at it.
     *
     * `unoptimized: true` was the previous answer, but that flag also switches
     * off srcset generation entirely: every device downloaded the master, and a
     * phone rendering the hero at ~340 CSS px was pulling the 900px file. A
     * custom loader keeps srcset while still emitting nothing but static files.
     */
    loader: 'custom',
    loaderFile: './lib/imageLoader.ts',
    // Must match the widths prep-assets emits, or Next will request a rung the
    // loader has to round away from.
    // Split so the two lists do not both contain 420, which would put the same
    // file in the srcset twice under different descriptors.
    deviceSizes: [720, 1080, 1400],
    imageSizes: [480],
  },
  experimental: {
    optimizePackageImports: ['gsap'],
  },
};

export default nextConfig;
