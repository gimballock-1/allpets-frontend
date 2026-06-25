/**
 * SINGLE SOURCE OF TRUTH for the design system's active theme.
 *
 * Each `key` corresponds 1:1 to a `[data-theme="…"]` block in src/app/globals.css.
 * Changing ACTIVE_THEME re-skins the ENTIRE site on the next build, because
 * RootLayout renders `<html data-theme={ACTIVE_THEME}>` (server-side, no flash).
 *
 * The client switcher on /styleguide can preview any theme live without a rebuild.
 */

export const THEMES = [
  { key: "fresh-clean", label: "Fresh & Clean" },
  { key: "playful-vibrant", label: "Playful & Vibrant" },
  { key: "warm-grounded", label: "Warm & Grounded" },
  { key: "bold-sunny", label: "Bold & Sunny" },
] as const;

/** "fresh-clean" | "playful-vibrant" | "warm-grounded" | "bold-sunny" */
export type ThemeKey = (typeof THEMES)[number]["key"];

/**
 * 🔑 The active site theme. Edit this ONE line to re-skin the whole app.
 * The client (All Pets) selected Fresh & Clean.
 */
export const ACTIVE_THEME: ThemeKey = "fresh-clean";

/** Runtime narrowing guard (for the switcher / any future persistence). */
export function isThemeKey(value: string): value is ThemeKey {
  return THEMES.some((t) => t.key === value);
}
