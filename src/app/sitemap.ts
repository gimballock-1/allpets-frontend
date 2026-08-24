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
/**
 * Sitemap entry for a content page (content/pages/<slug>.mdx), or [] when the
 * file doesn't exist — a deliberately pulled legal page 404s via LegalPage's
 * notFound(), and the sitemap must drop it, not keep advertising a dead <loc>.
 * (/about can't actually ship that way — its route throws at build when
 * about.mdx is missing — but it flows through the same honest guard.)
 *
 * The optional frontmatter `updatedAt` (the 8.11 "last updated" line) becomes
 * <lastmod>, so crawlers see the same freshness the page displays. The schema
 * types it as a bare string, so validate the W3C-datetime shape here and fail
 * the build loudly on garbage rather than serializing an invalid <lastmod>.
 */
function contentPageEntry(slug: string, priority: number): MetadataRoute.Sitemap {
  const page = getPage(slug);
  if (!page) return [];
  if (
    page.updatedAt !== undefined &&
    (!/^\d{4}-\d{2}-\d{2}(?:T|$)/.test(page.updatedAt) ||
      Number.isNaN(Date.parse(page.updatedAt)))
  ) {
    throw new Error(
      `content/pages/${slug}.mdx: updatedAt "${page.updatedAt}" is not a valid ` +
        `ISO date — it becomes the sitemap <lastmod>. Fix or remove it.`,
    );
  }
  return [
    {
      url: `${SITE_URL}/${slug}`,
      lastModified: page.updatedAt,
      changeFrequency: "monthly",
      priority,
    },
  ];
}

export default function sitemap(): MetadataRoute.Sitemap {
  // Services have no per-file timestamp in the 8.1 schema, so their entries
  // honestly omit <lastmod> rather than faking one from the build date.
  return [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/services`, changeFrequency: "weekly", priority: 0.8 },
    ...getServices().map((s) => ({
      url: `${SITE_URL}/services/${s.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...contentPageEntry("about", 0.5),
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.5 },
    ...contentPageEntry("privacy", 0.3),
    ...contentPageEntry("terms", 0.3),
  ];
}
