import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container, SectionHeading } from "@/components/ui";
import { RichText } from "@/components/RichText";
import { getPage } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

/**
 * Shared legal-page renderer (8.11) — /privacy and /terms are the same page
 * shape over different `Page` content entries (authored in 17.9; placeholder
 * bodies until then), so both routes delegate here. Missing/invalid content →
 * the branded 404 (8.12) per the issue contract — unlike /about, which
 * fail-fasts the build, a pulled legal page must 404, not crash.
 */

/** ISO date → "June 27, 2026"; unparseable content strings render verbatim. */
function formatUpdated(value: string): string {
  const ts = Date.parse(value);
  return Number.isNaN(ts)
    ? value
    : new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" }).format(ts);
}

/** Page `seo` group → metadata (the seam 12.1 consumes — don't re-resolve). */
export function legalMetadata(slug: string): Metadata {
  const page = getPage(slug);
  if (!page) return {};
  return pageMetadata({
    // An authored metaTitle already names the clinic — absolute skips the root
    // title.template so it isn't double-suffixed (same pattern as /about).
    title: page.seo?.metaTitle ? { absolute: page.seo.metaTitle } : page.title,
    description: page.seo?.metaDescription,
    // The content module's slug (not the caller's) is the canonical contract
    // with the sitemap (12.2); routes and slugs coincide for /privacy, /terms.
    path: `/${page.slug}`,
  });
}

export function LegalPage({ slug }: { slug: string }) {
  const page = getPage(slug);
  if (!page) notFound();

  return (
    <Container className="py-16">
      <SectionHeading as="h1" size="h1" eyebrow="Legal" title={page.title} />
      {page.updatedAt ? (
        <p className="text-small text-ink-subtle mt-4">
          Last updated {formatUpdated(page.updatedAt)}
        </p>
      ) : null}
      <article className="max-w-3xl">
        <RichText mdx={page.body} />
      </article>
    </Container>
  );
}
