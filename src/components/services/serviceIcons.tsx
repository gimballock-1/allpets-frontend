import type { ReactNode } from "react";

/**
 * Maps a Service's `icon` frontmatter key (content/services/*.mdx) to a decorative
 * inline SVG. Inline components (not <img>/SVG files) keep `dangerouslyAllowSVG`
 * off (next.config) and inherit `currentColor` from the card's icon tile. Add a key
 * here when a new `icon` value is introduced in content.
 */
const stroke = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const ICONS: Record<string, ReactNode> = {
  stethoscope: (
    <svg {...stroke}>
      <path d="M5 3v5a4 4 0 0 0 8 0V3" />
      <path d="M9 16a6 6 0 0 0 6 0" />
      <path d="M15 13v-1a4 4 0 0 1 4 4v1" />
      <circle cx="19" cy="19" r="2" />
    </svg>
  ),
  syringe: (
    <svg {...stroke}>
      <path d="m18 2 4 4" />
      <path d="m17 7 3-3" />
      <path d="M14 6 6.5 13.5a2 2 0 0 0 0 3l1 1a2 2 0 0 0 3 0L18 10" />
      <path d="M9 11 7 9" />
      <path d="M12 8l-2-2" />
      <path d="m6 14-3 3 2 2 3-3" />
    </svg>
  ),
  tooth: (
    <svg {...stroke}>
      <path d="M12 5.5C10.5 4 8.5 3.5 7 4.2 4.8 5.2 4 8 5 12c.6 2.4.8 6 2.2 7.4.9.9 2-.2 2.3-1.6.3-1.4.5-2.8 1.5-2.8s1.2 1.4 1.5 2.8c.3 1.4 1.4 2.5 2.3 1.6C16.2 18 16.4 14.4 17 12c1-4 .2-6.8-2-7.8-1.5-.7-3.5-.2-5 1.3Z" />
    </svg>
  ),
  scalpel: (
    <svg {...stroke}>
      <path d="M14 3 6 11l3 3 9-7a3 3 0 0 0-4-4Z" />
      <path d="m6 11-3 7 7-3" />
    </svg>
  ),
  paw: (
    <svg {...stroke}>
      <circle cx="8" cy="9" r="1.6" />
      <circle cx="16" cy="9" r="1.6" />
      <circle cx="5" cy="13.5" r="1.4" />
      <circle cx="19" cy="13.5" r="1.4" />
      <path d="M12 13c2.6 0 4.4 2 4.4 3.9 0 1.4-1.2 2.1-2.6 2.1-1 0-1.3-.4-1.8-.4s-.8.4-1.8.4c-1.4 0-2.6-.7-2.6-2.1C7.6 15 9.4 13 12 13Z" />
    </svg>
  ),
};

/** Returns the icon for a key, falling back to the paw glyph for unknown keys. */
export function serviceIcon(key: string): ReactNode {
  return ICONS[key] ?? ICONS.paw;
}
