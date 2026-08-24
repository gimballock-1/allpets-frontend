import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

/**
 * robots.txt (12.3) — served at /robots.txt. Public marketing pages are
 * crawlable; the same-origin /api/* proxy route handlers (contact, health —
 * non-content JSON) are not. There is NO /admin to hide: content is file-based
 * and baked into the image, so no CMS UI exists on this origin. book. and
 * analytics. are separate hosts (Cal.com, Plausible) with their own robots —
 * a seam for Epic 6, not this file.
 *
 * Exactly ONE `Sitemap:` line, built from the same SITE_URL constant 12.2 uses,
 * so robots and sitemap can't drift onto different origins. Phase 1 has only
 * the prod environment, so there is no preview-env `Disallow: /` branch (the
 * spec's env-awareness note) — add one if a non-prod deploy ever exists.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    // No `allow: "/"` — RFC 9309 default-allows anything not disallowed, and a
    // recorded Allow would win the longest-match tie-break against the
    // preview-env `Disallow: /` this file is expected to grow (see above).
    rules: [
      {
        userAgent: "*",
        disallow: [
          "/api/",
          // Epic 9 hasn't shipped /book yet, but BOOK_HREF links it from every
          // page (header/hero/CTAs) — block it so the first crawl doesn't chase
          // a site-wide 404. REMOVE this entry when the 9.x booking page lands.
          "/book",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
