import { ImageResponse } from "next/og";
import { getSite } from "@/lib/content";
import { ogImageAlt } from "@/lib/seo";

/**
 * Site-wide OG share image (12.5) — a 1200×630 card at /opengraph-image. The
 * file convention auto-injects og:image/twitter:image for every route below
 * the root, so 12.1's metadata never lists images (no double reference). No
 * dynamic API is read, so under pure SSG Next renders this ONCE at build into
 * a static PNG — no runtime image generation.
 *
 * Colors are the 7.3 Fresh & Clean tokens copied literally — satori can't
 * resolve the CSS variables in globals.css. Text uses ImageResponse's bundled
 * default font: loading the 7.4 brand fonts here would mean fetching font
 * files at build, and the build must work offline.
 *
 * PLACEHOLDER paw mark pending the real clinic logo (18.4) — swap the <PawMark>
 * block (and only it) when brand assets land.
 */

// 7.3 Fresh & Clean palette (globals.css [data-theme="fresh-clean"]).
const C = {
  brand: "#2670BE",
  secondary: "#54CBA0",
  accent: "#FF8A73",
  surface: "#FBFDFF",
  panel: "#EEF3F7",
  ink: "#1F2A33",
  inkMuted: "#475560",
  onBrand: "#FFFFFF",
} as const;

const site = getSite();

// Shared with pageMetadata's og:image re-reference (12.1) — one alt, one card.
export const alt = ogImageAlt();
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Placeholder brand mark: a paw drawn from circles on a brand tile (→ 18.4). */
function PawMark() {
  const toe = (left: number, top: number, d: number) => (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: d,
        height: d,
        borderRadius: 9999,
        backgroundColor: C.onBrand,
      }}
    />
  );
  return (
    <div
      style={{
        display: "flex",
        position: "relative",
        width: 120,
        height: 120,
        borderRadius: 28,
        backgroundColor: C.brand,
      }}
    >
      {toe(24, 22, 20)}
      {toe(50, 14, 20)}
      {toe(76, 22, 20)}
      <div
        style={{
          position: "absolute",
          left: 30,
          top: 46,
          width: 60,
          height: 48,
          borderRadius: 9999,
          backgroundColor: C.onBrand,
        }}
      />
    </div>
  );
}

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          backgroundColor: C.surface,
          backgroundImage: `linear-gradient(135deg, ${C.surface} 55%, ${C.panel} 100%)`,
        }}
      >
        {/* Decorative brand shapes, clipped by the canvas edges. */}
        <div
          style={{
            position: "absolute",
            right: -110,
            top: -110,
            width: 360,
            height: 360,
            borderRadius: 9999,
            backgroundColor: C.secondary,
            opacity: 0.3,
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 96,
            bottom: -140,
            width: 260,
            height: 260,
            borderRadius: 9999,
            backgroundColor: C.accent,
            opacity: 0.22,
          }}
        />

        <PawMark />

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: C.ink,
              lineHeight: 1.1,
              maxWidth: 950,
            }}
          >
            {site.clinicName}
          </div>
          <div
            style={{
              marginTop: 20,
              fontSize: 34,
              color: C.inkMuted,
              maxWidth: 900,
            }}
          >
            {site.tagline}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 28,
            fontWeight: 600,
            color: C.brand,
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 9999,
              backgroundColor: C.secondary,
            }}
          />
          {`${site.address.city}, ${site.address.state}`}
        </div>
      </div>
    ),
    size,
  );
}
