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

// Playful display — NOT a variable font: weights must be listed (Sniglet ships 400 & 800).
export const sniglet = Sniglet({
  subsets: ["latin"],
  weight: ["400", "800"],
  display: "swap",
  variable: "--font-sniglet",
});

// Headings / accent — list the weights actually used.
export const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-bevietnam",
});

/** All three variable classes, ready for the <html className>. */
export const fontVariables = `${jakarta.variable} ${sniglet.variable} ${beVietnam.variable}`;
