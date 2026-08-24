import type { MetadataRoute } from "next";
import { getPage, getServices } from "@/lib/content";
import { SITE_URL } from "@/lib/site-url";

/**
 * sitemap.xml (12.2) — served at /sitemap.xml, resolved at BUILD time (pure SSG)
 * from the 8.1 file-based content loader, NOT a hand-maintained URL list: the
 * service entries iterate `getServices()` (active-only — the exact source 8.8's
 * `generateStaticParams` builds pages from), so adding/retiring a service .mdx
 * updates page AND sitemap on the same commit + deploy, with no second list to
 * drift. A malformed content file throws inside the loader and fails the build —
 * never a silently partial sitemap.
 *
 * Marketing origin ONLY: no /api/* (non-content JSON proxy handlers, disallowed
 * by robots in 12.3), no off-host book./analytics. URLs (Cal.com and Plausible
 * own those hosts' robots/sitemaps), no /styleguide (internal design reference).
 * /book is NOT listed yet — that route doesn't exist until Epic 9 lands, and a
 * sitemap must never advertise a 404; add it alongside the 9.x page.
 *
 * Crawl hints per the 12.2 spec: Home 1.0 / services 0.8 / legal 0.3, `weekly`
 * for service content, `monthly` for the rest — content changes only via a
 * commit + deploy, so anything more frequent would be dishonest.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  // Content pages carry an optional frontmatter `updatedAt` (the 8.11 "last
  // updated" line on legal pages) — reuse it as <lastmod> so crawlers see the
  // same freshness the page displays. Services have no per-file timestamp in
  // the 8.1 schema, so their entries honestly omit <lastmod> rather than
  // faking one from the build date.
  const updatedAt = (slug: string): string | undefined => getPage(slug)?.updatedAt;

  return [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/services`, changeFrequency: "weekly", priority: 0.8 },
    ...getServices().map((s) => ({
      url: `${SITE_URL}/services/${s.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    {
      url: `${SITE_URL}/about`,
      lastModified: updatedAt("about"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.5 },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: updatedAt("privacy"),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: updatedAt("terms"),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];
}
