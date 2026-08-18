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
    // The optimizer is a server route, and there is no server. The sources are
    // already sized, matted webp from scripts/prep-assets.mjs, so serving them
    // as-authored costs bandwidth rather than fidelity.
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
    // Product renders are portrait-heavy; these widths cover the layout breakpoints.
    deviceSizes: [420, 640, 828, 1080, 1280, 1600, 1920],
    imageSizes: [96, 160, 240, 320, 480],
  },
  experimental: {
    optimizePackageImports: ['gsap'],
  },
};

export default nextConfig;
