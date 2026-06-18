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
};

export default nextConfig;
