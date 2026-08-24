/**
 * Single definition site for the three brand fonts (next/font, self-hosted).
 * Each exposes a CSS variable consumed by the design tokens in globals.css
 * (`--fam-display` / `--fam-body` / `--fam-accent` map these per theme).
 *
 * next/font loaders MUST be called at module top level with literal args
 * (Turbopack requirement) — import these instances elsewhere, never re-call.
 */
import { Plus_Jakarta_Sans, Sniglet, Be_Vietnam_Pro } from "next/font/google";

// Body / UI — variable font, so no explicit `weight`.
export const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
});

// Playful display — NOT a variable font: weights must be listed. Only 800 ships:
// every `font-accent`/`font-display` element carries font-semibold/font-bold
// (600/700 → nearest available = 800), so a 400 file would be preloaded dead
// weight on the mobile CWV budget (12.8). Re-add "400" here if a regular-weight
// Sniglet use ever lands.
export const sniglet = Sniglet({
  subsets: ["latin"],
  weight: ["800"],
  display: "swap",
  variable: "--font-sniglet",
});

// Headings / accent — list ONLY the weights actually used (12.8: each weight is
// a separate preloaded woff2 competing with the LCP on mobile). Site-wide the
// display/accent roles are used exclusively with font-semibold (600) and
// font-bold (700); 400/500 had no call sites in any theme. Re-add a weight here
// the moment a use appears — a missing weight silently faux-bolds/relies on
// nearest-match instead of failing the build.
export const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
  variable: "--font-bevietnam",
});

/** All three variable classes, ready for the <html className>. */
export const fontVariables = `${jakarta.variable} ${sniglet.variable} ${beVietnam.variable}`;
