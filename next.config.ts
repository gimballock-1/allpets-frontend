import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Slim runner for the 7.8 Dockerfile (ships .next/standalone; mirrors local-ai-proxy).
  output: "standalone",

  // Build must fail on type errors — never silently ship a broken build (CI 15.3).
  typescript: {
    ignoreBuildErrors: false,
  },
  // Next 16 dropped the build-time ESLint integration (and its `eslint` config key);
  // linting is enforced as a separate `pnpm lint` step in CI (15.3).

  // Image pipeline (7.7 loader/source + 7.13 optimization). Marketing imagery is
  // LOCAL — committed under `public/images/`, static-imported (Next derives
  // dimensions + blurDataURL). No remote media origin in phase 1, so NO
  // `remotePatterns`. The optimizer runs at the Node-server edge — mind the 2.12
  // co-tenant CPU budget (we trim variants below; the documented fallback is to
  // commit pre-sized assets). Icons are inline components, so SVGs never reach the
  // optimizer and `dangerouslyAllowSVG` stays at its secure default.
  images: {
    // Modern formats with fallback; the optimizer negotiates AVIF→WebP→source
    // via the request Accept header (req §8.3).
    formats: ["image/avif", "image/webp"],
    // Tuned to the project breakpoints (360/768/1280/1920 — req §8.8) + retina.
    // Dropped Next's default 2048/3840 to avoid generating unused giant variants
    // (CPU on quasar — 2.12).
    deviceSizes: [420, 640, 768, 1080, 1280, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: false,
  },
};

export default nextConfig;
