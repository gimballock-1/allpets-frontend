/**
 * Canonical public origin of the marketing site (12.2/12.3) — the ONE place the
 * absolute base URL is written down. `app/sitemap.ts` and `app/robots.ts` both
 * import it, so the sitemap's <loc> host and robots' `Sitemap:` line can never
 * point at different origins (12.1 metadata can reuse it for `metadataBase`).
 *
 * Deliberately a constant, NOT an env var: the 12.2 spec's `NEXT_PUBLIC_SITE_URL`
 * was never introduced by 7.9, and phase 1 has exactly one environment — prod.
 * Adding a NEXT_PUBLIC_* var means editing .env.example AND the Dockerfile ARG
 * defaults in lockstep (7.8/7.9 convention) for a value with a single possible
 * reading. If a non-prod preview ever exists, promote this into `publicEnv`
 * (src/env.ts) and key robots' allow/deny off it then.
 *
 * No trailing slash — callers append rooted paths (`${SITE_URL}/services`).
 */
export const SITE_URL = "https://allpets.skpodduturi.dev";
