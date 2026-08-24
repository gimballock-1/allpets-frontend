import { requiredUrl } from "@/lib/env-validators";

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
 * Shape-checked at module load with the 7.9 validator, so a typo'd origin fails
 * the BUILD (this module is only imported by build-time metadata routes), not
 * the crawl; the `.origin` comparison additionally rejects any path, query, or
 * trailing slash — callers append rooted paths (`${SITE_URL}/services`), so a
 * trailing slash would emit double-slash URLs.
 */
export const SITE_URL = requiredUrl(
  "SITE_URL (src/lib/site-url.ts)",
  "https://allpets.skpodduturi.dev",
);
if (new URL(SITE_URL).origin !== SITE_URL) {
  throw new Error(
    `SITE_URL must be a bare origin with no path, query, or trailing slash (got "${SITE_URL}").`,
  );
}
