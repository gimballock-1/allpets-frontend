/**
 * Google Maps link-out helpers (8.6 footer ↔ 8.10 contact page). The site links
 * OUT to Google Maps (req §6.3) — no Maps JS SDK, no API key; the on-page map
 * is static OSM tiles (see src/lib/staticMap.ts).
 */
import type { SiteSetting } from "@/lib/content";

/** "1234 Example Ave, Norman, OK 73069" — the one display form of the address. */
export function addressLine(address: SiteSetting["address"]): string {
  return `${address.street}, ${address.city}, ${address.state} ${address.zip}`;
}

/** Universal cross-platform Maps search URL for the clinic (opens app or web). */
export function googleMapsUrl(site: SiteSetting): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${site.clinicName}, ${addressLine(site.address)}`,
  )}`;
}
