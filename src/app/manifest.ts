import type { MetadataRoute } from "next";

/**
 * Web app manifest (7.12) → served at /manifest.webmanifest (Next auto-links it).
 * Colors come from the 7.3 Fresh & Clean palette (brand + surface).
 *
 * PLACEHOLDER icon set pending the real clinic logo (18.4) — the real mark swaps
 * in by replacing the icon files (same filenames); no change needed here.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "All Pets Veterinary Hospital",
    short_name: "All Pets",
    description: "Compassionate veterinary care in Norman, Oklahoma.",
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
