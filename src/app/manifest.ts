import type { MetadataRoute } from "next";
import { getSite } from "@/lib/content";

/**
 * Web app manifest (7.12) → served at /manifest.webmanifest (Next auto-links it).
 * Colors come from the 7.3 Fresh & Clean palette (brand + surface); name/copy
 * come from the 8.1 content layer like the root layout's metadata (12.1) — not
 * re-hardcoded here.
 *
 * PLACEHOLDER icon set pending the real clinic logo (18.4) — the real mark swaps
 * in by replacing the icon files (same filenames); no change needed here.
 */
export default function manifest(): MetadataRoute.Manifest {
  const site = getSite();
  return {
    name: site.clinicName,
    // The one hand-written string: the 8.1 schema has no short-name field, and
    // a manifest short_name must fit under an icon (~12 chars).
    short_name: "All Pets",
    description: site.tagline,
    start_url: "/",
    display: "standalone",
    background_color: "#FBFDFF", // 7.3 surface
    theme_color: "#2670BE", // 7.3 brand primary
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
