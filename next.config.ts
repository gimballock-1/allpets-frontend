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

  // Image pipeline (7.7). Phase-1 marketing imagery is LOCAL — committed under
  // `public/images/` and static-imported (Next derives dimensions + blurDataURL).
  // There is no remote media origin in phase 1 (no MinIO), so NO `remotePatterns`
  // are configured. Loader = Next's built-in optimizer over local/static assets
  // (the default); it optimizes at the Node server edge, so mind the 2.12
  // co-tenant CPU budget. Format/size/lazy tuning is deferred to 7.13. Icons are
  // inline React/SVG components (not passed through next/image), so SVGs never hit
  // the optimizer and `dangerouslyAllowSVG` stays false (its secure default).
  images: {
    dangerouslyAllowSVG: false,
  },
};

export default nextConfig;
