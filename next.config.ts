import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
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
