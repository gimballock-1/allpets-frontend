import type { Metadata } from "next";
import { getSite } from "@/lib/content";

/**
 * Site-wide SEO plumbing (12.1) — the ONE definition site for the production
 * origin and the per-page metadata shape (req §8.2).
 *
 * `SITE_URL` feeds the root layout's `metadataBase`, so every relative
 * `canonical` / `og:url` a page declares resolves to the absolute production
 * origin — never `localhost`, even in a dev/preview render. Overridable via
 * `NEXT_PUBLIC_SITE_URL` (7.9), but the production origin is the baked-in
 * fallback so no new Dockerfile build-arg / CI variable is required.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://allpets.skpodduturi.dev";

type PageMeta = {
  /** Plain string → runs through the root `title.template`; `{ absolute }`
   *  skips it, for authored metaTitles that already name the clinic. */
  title: string | { absolute: string };
  /** ~150–160 chars; omitted → the site default (hero subcopy), so every
   *  public route always emits a description + og:description. */
  description?: string;
  /** Site-relative canonical path ("/", "/services/{slug}", …) — production
   *  origin comes from metadataBase; no query strings. Must be the SAME slug
   *  the content module defines so canonicals match the sitemap (12.2). */
  path: string;
};

/** ONE alt string for the ONE share card — src/app/opengraph-image.tsx (its
 *  `alt` export) and pageMetadata (its og:image re-reference) must agree. */
export function ogImageAlt(): string {
  const site = getSite();
  return `${site.clinicName} — ${site.tagline}`;
}

/**
 * Per-page metadata (12.1): title, description, ONE canonical, and a complete
 * OG block. `openGraph` merges SHALLOWLY across segments — a page-level object
 * replaces the layout's RESOLVED one wholesale, including the og:image the
 * root file convention (12.5) injected — so the og block is composed whole
 * here (type/siteName/locale AND the image re-reference included) instead of
 * split across layout + pages. At the root segment itself (Home) file-based
 * metadata outranks this config entry, so the card is never double-emitted.
 */
export function pageMetadata({ title, description, path }: PageMeta): Metadata {
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
      // suffix itself — mirroring the root title.template ("%s — {clinicName}").
      title:
        typeof title === "string" ? `${title} — ${site.clinicName}` : title.absolute,
      description: desc,
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          type: "image/png",
          alt: ogImageAlt(),
        },
      ],
    },
  };
}
