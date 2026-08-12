import { Image } from "@/components/ui";
import { staticMapGeometry } from "@/lib/staticMap";
import { cn } from "@/lib/cn";

export type StaticMapProps = {
  lat: number;
  lng: number;
  /** Google Maps link-out target (built by lib/maps googleMapsUrl). */
  href: string;
  /** Accessible name for the link, e.g. the clinic address. */
  label: string;
  className?: string;
};

/**
 * Static map (8.10, req §6.3) — committed OSM tiles positioned so the clinic
 * sits at the container's center, a brand pin on top, the whole thing one link
 * out to Google Maps. No Maps JS SDK, no API key, no third-party request at
 * page view. The imagery is decorative (aria-hidden); the LINK carries the
 * accessible name. Fixed heights reserve the space (CLS, req §8.3 — the 8.13
 * discipline). Attribution is required by the OSM license (ODbL) and rendered
 * by the caller OUTSIDE the link (a nested copyright link would be invalid).
 */
export function StaticMap({ lat, lng, href, label, className }: StaticMapProps) {
  const { tiles, pointX, pointY, canvasSize } = staticMapGeometry(lat, lng);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open our location in Google Maps (opens in new tab): ${label}`}
      className={cn("group block", className)}
    >
      <span
        aria-hidden="true"
        className="rounded-card border-border relative block h-64 overflow-hidden border shadow-sm sm:h-72"
      >
        {/* Tile canvas, offset so the geo point lands at the container center. */}
        <span
          className="absolute block"
          style={{
            width: canvasSize,
            height: canvasSize,
            left: `calc(50% - ${pointX}px)`,
            top: `calc(50% - ${pointY}px)`,
          }}
        >
          {tiles.map((tile) => (
            <Image
              key={tile.src}
              src={tile.src}
              alt=""
              width={256}
              height={256}
              // Already-optimized 256px PNGs — routing 9 of them through the
              // image optimizer would only re-encode them.
              unoptimized
              draggable={false}
              className="absolute max-w-none select-none"
              style={{ left: tile.left, top: tile.top }}
            />
          ))}
        </span>

        {/* Pin — tip at the geo point (the container center). */}
        <svg
          viewBox="0 0 24 24"
          className="text-brand-strong absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-full drop-shadow-md"
          fill="currentColor"
        >
          <path d="M12 2a7 7 0 0 0-7 7c0 5.1 6.1 11.9 6.4 12.2a.8.8 0 0 0 1.2 0C12.9 20.9 19 14.1 19 9a7 7 0 0 0-7-7Zm0 9.6A2.6 2.6 0 1 1 12 6.4a2.6 2.6 0 0 1 0 5.2Z" />
        </svg>

        <span className="bg-paper/90 text-brand-strong text-small rounded-pill absolute bottom-3 right-3 px-3 py-1.5 font-semibold shadow-sm transition-colors group-hover:bg-paper">
          Open in Google Maps <span aria-hidden="true">↗</span>
        </span>
      </span>
    </a>
  );
}
