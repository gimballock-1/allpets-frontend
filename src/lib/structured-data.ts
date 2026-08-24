/**
 * schema.org structured-data builders (12.4, req §8.2) — typed JSON-LD for the
 * clinic, sourced from the ONE site-settings module (8.1) so the NAP can never
 * drift from what the UI (and the Google Business Profile) shows. Pure functions:
 * no fs, no fetch — safe at build time, where all of this bakes into static HTML.
 */
import { WEEKDAYS, type DayHours, type SiteSetting } from "@/lib/content/schema";
// The ONE canonical origin (12.2/12.3) — sharing it means the JSON-LD @id/url/
// image can never point at a different host than the sitemap <loc> / robots
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

export type VeterinaryCareJsonLd = {
  "@context": "https://schema.org";
  "@type": "VeterinaryCare";
  "@id": string;
  name: string;
  legalName?: string;
  url: string;
  telephone: string;
  email: string;
  image: string;
  logo: string;
  address: PostalAddress;
  geo?: GeoCoordinates;
  openingHoursSpecification: OpeningHoursSpecification[];
  sameAs?: string[];
};

/**
 * Map the per-day site-settings `hours` rows onto `OpeningHoursSpecification`s:
 * canonical Mon→Sun order first (content lists all 7 days but order isn't
 * enforced), then days sharing identical open/close merge into one spec with a
 * `dayOfWeek` array. Closed days (null open/close) are OMITTED entirely — the
 * schema.org convention — never faked as "00:00"–"00:00".
 */
function openingHours(hours: SiteSetting["hours"]): OpeningHoursSpecification[] {
  const byDay = new Map(hours.map((row) => [row.day, row]));
  const groups = new Map<string, OpeningHoursSpecification>();
  for (const day of WEEKDAYS) {
    const row = byDay.get(day);
    if (!row?.open || !row.close) continue; // null ⇒ closed that day
    const key = `${row.open}|${row.close}`;
    const group = groups.get(key);
    if (group) {
      group.dayOfWeek.push(SCHEMA_DAY[day]);
    } else {
      groups.set(key, {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [SCHEMA_DAY[day]],
        opens: row.open,
        closes: row.close,
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
export function veterinaryCareJsonLd(site: SiteSetting): VeterinaryCareJsonLd {
  // PLACEHOLDER mark pending the real clinic logo (18.4) — same file-swap
  // contract as the manifest icons, so this URL stays stable when it lands.
  const logoUrl = `${SITE_URL}/icons/icon-512.png`;

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
    image: logoUrl,
    logo: logoUrl,
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
    ...(site.socials.length > 0 ? { sameAs: site.socials.map((s) => s.url) } : {}),
  };
}

/**
 * XSS guard (#42): serialize for a `<script type="application/ld+json">` body
 * with every `<` escaped, so a stray `</script>` (or any tag) inside a content
 * string can't close the block and inject markup. Content is committed + typed,
 * but the guard costs nothing and removes the class of bug.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
