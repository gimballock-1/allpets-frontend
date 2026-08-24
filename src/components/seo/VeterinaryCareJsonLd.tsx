import { getSite } from "@/lib/content";
import { serializeJsonLd, veterinaryCareJsonLd } from "@/lib/structured-data";

/**
 * `schema.org/VeterinaryCare` JSON-LD block (12.4, req §8.2) — a Server
 * Component, so crawlers see the markup in the baked HTML without running JS.
 * Self-contained (reads the 8.1 `getSite()` itself) and rendered exactly once
 * per page — Home + Contact each mount it directly, never via a shared section
 * component, so a page can't end up with duplicate blocks.
 */
export function VeterinaryCareJsonLd() {
  const data = veterinaryCareJsonLd(getSite());
  return (
    <script
      type="application/ld+json"
      // serializeJsonLd escapes `<` (#42 XSS guard) — a stray "</script>" in a
      // content string can't break out of the JSON-LD block.
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
