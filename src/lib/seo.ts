import type { Metadata } from "next";
import { getSite } from "@/lib/content";

/**
 * Site-wide SEO plumbing (12.1) — the per-page metadata shape (req §8.2). The
 * production origin itself lives in src/lib/site-url.ts (12.2/12.3), imported
 * by the root layout for `metadataBase` so canonicals/og:url can never split
 * from the sitemap's <loc> host — never redefined here.
 */

/** "{clinicName} — {city}, {state}": the Home/tab-default title (12.1). */
export function siteTitle(): string {
  const site = getSite();
  return `${site.clinicName} — ${site.address.city}, ${site.address.state}`;
}

/** "{name} — {clinicName}": the ONE suffix rule behind the root
 *  title.template (`withClinicSuffix("%s")`) and og:title — never hand-built. */
export function withClinicSuffix(name: string): string {
  return `${name} — ${getSite().clinicName}`;
}

/** ONE alt string for the ONE share card — src/app/opengraph-image.tsx (its
 *  `alt` export) and pageMetadata (its og:image re-reference) must agree. */
export function ogImageAlt(): string {
  const site = getSite();
  return `${site.clinicName} — ${site.tagline}`;
}

/** The 12.5 card's dimensions/format — single definition, consumed by BOTH
 *  src/app/opengraph-image.tsx (its `size`/`contentType` exports) and the
 *  og:image re-reference below, so the emitted og:image:width/height/type can
 *  never drift from what the route actually renders. */
export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;
export const OG_IMAGE_CONTENT_TYPE = "image/png";

type PageMeta = {
  /** Plain string → runs through the root `title.template`; `{ absolute }`
   *  skips it, for authored metaTitles that already name the clinic. */
  title: string | { absolute: string };
  /** ~150–160 chars; omitted → the site default (hero subcopy), so every
   *  public route always emits a description + og:description. */
  description?: string;
  /** Site-relative canonical path ("/", "/services/{slug}", …) — production
   *  origin comes from metadataBase; no query strings. Must be the SAME path
   *  the route actually serves so canonicals match the sitemap (12.2). */
  path: string;
};

/**
 * Per-page metadata (12.1): title, description, ONE canonical, and a complete
 * OG block. `openGraph` merges SHALLOWLY across segments — a page-level object
 * replaces the layout's RESOLVED one wholesale, including the og:image the
 * root file convention (12.5) injected — so the og block is composed whole
 * here (type/siteName/locale AND the image re-reference included) instead of
 * split across layout + pages.
 */
export function pageMetadata({ title, description, path }: PageMeta): Metadata {
  // Canonical discipline (12.1): rooted, no query, no trailing slash — a bad
  // path here ships a wrong canonical on every build, so fail the build.
  if (!path.startsWith("/") || path.includes("?") || (path !== "/" && path.endsWith("/"))) {
    throw new Error(
      `pageMetadata: path must be rooted with no query or trailing slash (got "${path}")`,
    );
  }
  const site = getSite();
  const desc = description ?? site.hero.subcopy;
  return {
    title,
    description: desc,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: site.clinicName,
      locale: "en_US",
      url: path,
      // Share cards mostly ignore og:site_name, so og:title carries the clinic
      // suffix itself — same rule as the root title.template.
      title: typeof title === "string" ? withClinicSuffix(title) : title.absolute,
      description: desc,
      // COUPLING: this literal is src/app/opengraph-image.tsx's route, valid
      // only while that file sits at the app root — moved under a route group,
      // Next hash-suffixes the route and this string silently 404s. The whole
      // scheme leans on openGraph's shallow merge: this config entry WINS over
      // the file-convention entry on every page that passes through here (root
      // segment included — Next 16 resolves config images over the file's
      // hashed URL), so exactly one og:image is emitted, at the cost of the
      // file convention's cache-busting query. scripts/a11y-scan.mjs preflights
      // this exact path so a move fails CI loudly, not silently in crawlers.
      images: [
        {
          url: "/opengraph-image",
          width: OG_IMAGE_SIZE.width,
          height: OG_IMAGE_SIZE.height,
          type: OG_IMAGE_CONTENT_TYPE,
          alt: ogImageAlt(),
        },
      ],
    },
  };
}
