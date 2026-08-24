/**
 * Computed non-default-state contrast gate (12.10, issue #48 — closing the
 * manual audit's residual risk #1 from 12.7/#45).
 *
 * The axe scan (12.6, scripts/a11y-scan.mjs) only ever sees the DEFAULT
 * states of the ACTIVE theme — it can never catch a token edit that breaks a
 * focus ring, a field boundary, or a hover pair, and it says nothing about
 * the three themes the client didn't pick. These are exactly the pairs the
 * 12.7 manual audit had to verify by hand (its two Serious findings, F1/F2,
 * both lived here), recomputed arithmetically (WCAG relative luminance) from
 * the raw hex tokens of EVERY `[data-theme]` block in globals.css on every
 * run — so a palette tweak can't silently regress them, whichever theme ends
 * up shipping. Needs no build or browser; `pnpm a11y` runs it before the axe
 * scan (which is how CI picks it up).
 *
 * Guarded pairs (fg = the painted indicator, bg = what it's painted on):
 *   - `.bg-brand :focus-visible` outline on the brand band  (F1 fix)
 *   - global focus outline on surface / on paper
 *   - contact-form input boundary on paper                  (F2 fix)
 *   - primary Button hover text (the audit's no-headroom caveat pair)
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

// ── WCAG 2.1 relative luminance + contrast ratio (the audit's method) ────────
const channel = (c) => {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

function fail(msg) {
  console.error(`contrast-check: ${msg}`);
  process.exit(1);
}

// ── Parse the raw token blocks out of globals.css ────────────────────────────
// Theme blocks are flat (`[data-theme="…"] { --token: value; … }`, no nested
// braces) by the file's own structure, so a brace-free body match is exact.
const css = fs.readFileSync(path.join(root, "src", "app", "globals.css"), "utf8");
const themes = new Map();
for (const m of css.matchAll(/\[data-theme="([a-z0-9-]+)"\]\s*\{([^{}]*)\}/g)) {
  const tokens = {};
  for (const t of m[2].matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    tokens[t[1]] = t[2].trim();
  }
  themes.set(m[1], tokens);
}

// Cross-check against THEMES in src/lib/theme.ts — the declared 1:1 source of
// truth. A theme registered there but missing a css block (or vice versa)
// means the parse above is stale/broken; refuse a vacuous pass either way.
const themeTs = fs.readFileSync(path.join(root, "src", "lib", "theme.ts"), "utf8");
const declared = [...themeTs.matchAll(/key:\s*"([a-z0-9-]+)"/g)].map((m) => m[1]);
if (declared.length === 0) {
  fail("parsed no theme keys from src/lib/theme.ts — the parser is broken.");
}
for (const key of declared) {
  if (!themes.has(key)) {
    fail(`theme "${key}" (src/lib/theme.ts) has no [data-theme="${key}"] block in globals.css.`);
  }
}
for (const key of themes.keys()) {
  if (!declared.includes(key)) {
    fail(`[data-theme="${key}"] block in globals.css is not declared in src/lib/theme.ts.`);
  }
}

/** A token must be a plain 6-digit hex to be checkable — anything else (a
 *  var(), color-mix(), missing token) makes the ratio uncomputable: fail
 *  loudly rather than skip the pair. */
function hexToken(theme, name) {
  const value = themes.get(theme)?.[name];
  if (!value) fail(`theme "${theme}" is missing --${name}.`);
  if (!/^#[0-9a-fA-F]{6}$/.test(value)) {
    fail(
      `theme "${theme}" --${name} is "${value}" — not a 6-digit hex; ` +
        "this check can only compute plain hex tokens (extend it if the token format changes).",
    );
  }
  return value;
}

// ── The guarded pairs ────────────────────────────────────────────────────────
// floor 3.0  → WCAG 1.4.11 non-text contrast (focus indicators, field bounds)
// floor 4.5  → WCAG 1.4.3 text contrast (hover is still body-size text)
const PAIRS = [
  { label: "focus outline on brand band (--on-brand vs --brand)", fg: "on-brand", bg: "brand", floor: 3.0 },
  { label: "focus outline on surface (--brand-strong vs --surface)", fg: "brand-strong", bg: "surface", floor: 3.0 },
  { label: "focus outline on paper (--brand-strong vs --paper)", fg: "brand-strong", bg: "paper", floor: 3.0 },
  { label: "input boundary on paper (--input-border vs --paper)", fg: "input-border", bg: "paper", floor: 3.0 },
  { label: "primary Button hover text (--on-brand vs --brand-hover)", fg: "on-brand", bg: "brand-hover", floor: 4.5 },
];

let failures = 0;
for (const theme of declared) {
  console.log(`contrast-check: [${theme}]`);
  for (const { label, fg, bg, floor } of PAIRS) {
    const ratio = contrast(hexToken(theme, fg), hexToken(theme, bg));
    const ok = ratio >= floor;
    if (!ok) failures += 1;
    console.log(
      `  ${ok ? "PASS" : "FAIL"} ${ratio.toFixed(2)}:1 (floor ${floor}:1) — ${label}`,
    );
  }
}

if (failures > 0) {
  fail(
    `${failures} token pair(s) below their WCAG floor — a theme edit regressed a ` +
      "non-default state axe cannot see (12.7 findings F1/F2 territory). Fix the token, " +
      "don't lower the floor.",
  );
}
console.log(
  `contrast-check: ${declared.length} themes × ${PAIRS.length} pairs OK — non-default-state contrast holds in every theme`,
);
