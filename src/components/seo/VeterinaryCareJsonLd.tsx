import { getSite } from "@/lib/content";
import { veterinaryCareJsonLd } from "@/lib/structured-data";
import { JsonLd } from "./JsonLd";

/**
 * `schema.org/VeterinaryCare` JSON-LD block (12.4, req §8.2) — a Server
 * Component, so crawlers see the markup in the baked HTML without running JS.
 * Self-contained (reads the 8.1 `getSite()` itself) and rendered exactly once
 * per page — Home + Contact each mount it directly, never via a shared section
 * component, so a page can't end up with duplicate blocks.
 */
export function VeterinaryCareJsonLd() {
  return <JsonLd data={veterinaryCareJsonLd(getSite())} />;
}
