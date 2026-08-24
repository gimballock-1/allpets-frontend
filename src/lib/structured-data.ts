/**
 * schema.org structured-data builders (12.4, req §8.2) — typed JSON-LD for the
 * clinic, sourced from the ONE site-settings module (8.1) so the NAP can never
 * drift from what the UI (and the Google Business Profile) shows. Pure functions:
 * no fs, no fetch — safe at build time, where all of this bakes into static HTML.
 */
import "server-only";
import { WEEKDAYS, type DayHours, type SiteSetting } from "@/lib/content/schema";
// The ONE canonical origin (12.2/12.3) — sharing it means the JSON-LD @id/url/
// logo can never point at a different host than the sitemap <loc> / robots
// Sitemap: line. (#42 specced NEXT_PUBLIC_SITE_URL; see site-url.ts for why
// it's a constant instead.)
import { SITE_URL } from "@/lib/site-url";

/** schema.org day-of-week enumeration URLs (the canonical `dayOfWeek` form). */
const SCHEMA_DAY: Record<DayHours["day"], string> = {
  monday: "https://schema.org/Monday",
  tuesday: "https://schema.org/Tuesday",
  wednesday: "https://schema.org/Wednesday",
  thursday: "https://schema.org/Thursday",
  friday: "https://schema.org/Friday",
  saturday: "https://schema.org/Saturday",
  sunday: "https://schema.org/Sunday",
};

type OpeningHoursSpecification = {
  "@type": "OpeningHoursSpecification";
  dayOfWeek: string[];
  /** 24h "HH:MM" — the site-settings time format is already schema.org's. */
  opens: string;
  closes: string;
};

type PostalAddress = {
  "@type": "PostalAddress";
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
  addressCountry: string;
};

type GeoCoordinates = {
  "@type": "GeoCoordinates";
  latitude: number;
  longitude: number;
};

// Not exported (and named apart from the `VeterinaryCareJsonLd` COMPONENT) —
// exporting it made auto-import offer a type where the component belongs.
type VeterinaryCare = {
  "@context": "https://schema.org";
  "@type": "VeterinaryCare";
  "@id": string;
  name: string;
  legalName?: string;
  url: string;
  telephone: string;
  email: string;
  logo: string;
  address: PostalAddress;
  geo?: GeoCoordinates;
  openingHoursSpecification: OpeningHoursSpecification[];
};

/**
 * Map the per-day site-settings `hours` rows onto `OpeningHoursSpecification`s:
 * canonical Mon→Sun order first (content lists all 7 days, but order isn't
 * enforced), then days sharing identical hours merge into one spec with a
 * `dayOfWeek` array. Closed (null/null) days use Google's documented
 * all-day-closed form — opens/closes "00:00" — so crawlers read "closed
 * Sunday", not "no data for Sunday". Unambiguous: the DayHours refinement
 * requires close > open, so "00:00"–"00:00" can't be authored as real hours.
 */
function openingHours(hours: SiteSetting["hours"]): OpeningHoursSpecification[] {
  const ordered = [...hours].sort(
    (a, b) => WEEKDAYS.indexOf(a.day) - WEEKDAYS.indexOf(b.day),
  );
  const groups = new Map<string, OpeningHoursSpecification>();
  for (const row of ordered) {
    const opens = row.open ?? "00:00";
    const closes = row.close ?? "00:00";
    const key = `${opens}|${closes}`;
    const group = groups.get(key);
    if (group) {
      group.dayOfWeek.push(SCHEMA_DAY[row.day]);
    } else {
      groups.set(key, {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [SCHEMA_DAY[row.day]],
        opens,
        closes,
      });
    }
  }
  return [...groups.values()];
}

/**
 * The clinic's `schema.org/VeterinaryCare` entity (12.4) from the validated
 * SiteSetting. Every value flows from content (or committed public/ assets) —
 * nothing here is invented. Deliberately NO `aggregateRating`: Home's reviews
 * are the 8.5 placeholder fixture, and Google's policy forbids fabricated
 * review markup — the real hook is the Spring `/reviews` cache (#90).
 */
export function veterinaryCareJsonLd(site: SiteSetting): VeterinaryCare {
  return {
    "@context": "https://schema.org",
    "@type": "VeterinaryCare",
    // Stable entity id, so the Home + Contact copies of this block read as the
    // SAME clinic to crawlers — not two competing entities.
    "@id": `${SITE_URL}/#clinic`,
    name: site.clinicName,
    ...(site.legalName ? { legalName: site.legalName } : {}),
    url: `${SITE_URL}/`,
    // E.164 per schema.org guidance; the display form ("(405) …") stays UI-only.
    telephone: site.phoneE164,
    email: site.email,
    // PLACEHOLDER mark pending the real clinic logo (18.4) — same file-swap
    // contract as the manifest icons, so this URL stays stable when it lands.
    // No `image` alongside it: Google wants a business PHOTO there, which
    // doesn't exist yet, and duplicating the logo adds nothing (optional for
    // LocalBusiness).
    logo: `${SITE_URL}/icons/icon-512.png`,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.state,
      postalCode: site.address.zip,
      addressCountry: site.address.country,
    },
    // geo is optional in the content schema — emit only when authored (12.4
    // must never invent coordinates).
    ...(site.geo
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: site.geo.lat,
            longitude: site.geo.lng,
          },
        }
      : {}),
    openingHoursSpecification: openingHours(site.hours),
    // NO sameAs: the site-settings socials are PROVISIONAL, and unlike the
    // deliberately-fictional 555 phone they are registrable real-world
    // identifiers — asserting the clinic IS those profiles corrupts entity
    // reconciliation if either handle belongs to someone else. Re-add from
    // site.socials once Epic 18 confirms the real profiles.
  };
}

/**
 * XSS guard (#42): serialize for a `<script type="application/ld+json">` body
 * with every `<` escaped, so a stray `</script>` (or any tag) inside a content
 * string can't close the block and inject markup. Content is committed + typed,
 * but the guard costs nothing and removes the class of bug. Takes `object`
 * (never a bare primitive/undefined): JSON-LD roots are objects, and
 * `JSON.stringify(undefined)` would return undefined → a TypeError downstream.
 */
export function serializeJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
