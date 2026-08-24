import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Slim runner for the 7.8 Dockerfile (ships .next/standalone; mirrors local-ai-proxy).
  output: "standalone",

  // Don't auto-generate AGENTS.md/CLAUDE.md on `next dev` — agent guidance for
  // this repo lives in the workspace CLAUDE.md + the graphify knowledge graph.
  agentRules: false,

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

  // Baseline security headers (14.1, req §8.4) — set HERE, not as Traefik
  // middleware, so the policy ships inside the app image, is reviewed in this
  // repo, and exists in exactly ONE place (app + edge both setting a header
  // risks duplicate/conflicting values). `source: "/(.*)"` covers every
  // response the standalone server emits: pages, /_next/* assets, and the
  // /api/* route handlers. Deliberately NO Content-Security-Policy /
  // frame-ancestors — the CSP is policy-heavy and embed-sensitive (the future
  // Cal.com iframe, Epic 9), so it's split out into 14.11.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Two-year HTTPS pin. includeSubDomains is safe: the site is the
          // ONLY host at/under allpets.skpodduturi.dev — api-allpets etc. are
          // sibling hosts, not subdomains, so they're unaffected. NO `preload`
          // on purpose: the browser preload list is a near-irreversible
          // opt-in ratchet (14.1 treats it as a deliberate later step).
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
          // Responses are interpreted only as their declared type — no MIME
          // sniffing a text upload into executable script.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Cross-origin navigations leak only the origin; same-origin keeps
          // the full URL (analytics still see internal paths).
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Nobody frames US (clickjacking); we are the FRAMER of Cal.com
          // (Epic 9), so this doesn't touch the embed. The modern CSP
          // `frame-ancestors` equivalent lands with 14.11 — keep consistent.
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Opt out of powerful browser APIs a marketing site never uses.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
