# All Pets — Design System

The whole site's look is driven by **semantic design tokens**. Components never hardcode
colors, fonts, radii, or shadows — they reference token-backed utility classes
(`bg-brand`, `text-ink-muted`, `rounded-card`, `shadow-md`, `font-display`, `text-display`).
That means the entire look can change from **one place**, and four complete themes ship
ready to switch between.

**Active theme: Fresh & Clean** (the client's pick). The other three —
Playful & Vibrant, Warm & Grounded, Bold & Sunny — are preserved and one edit away.

---

## Where everything lives

| File | What it owns |
|------|--------------|
| `src/lib/theme.ts` | **The single source of truth.** `ACTIVE_THEME` picks the shipped theme; `THEMES` lists all of them. |
| `src/app/globals.css` | The token layer: one `[data-theme="…"]` block per theme + the Tailwind `@theme inline` bridge that turns tokens into utilities. |
| `src/app/fonts.ts` | The three brand fonts (Plus Jakarta Sans, Sniglet, Be Vietnam Pro) via `next/font`, each exposed as a CSS variable. |
| `src/app/layout.tsx` | Applies the font variables and sets `<html data-theme={ACTIVE_THEME}>`. |
| `src/app/styleguide/` | A live `/styleguide` page to preview tokens and flip themes without a rebuild. |

---

## How it works (the one important idea)

1. Each theme is a block of **raw values** in `globals.css`, e.g.:
   ```css
   [data-theme="fresh-clean"] { --brand: #2E7DD1; --ink: #1F2A33; --r-card: 12px; … }
   ```
2. The `@theme inline` block maps those raw values into Tailwind utilities:
   ```css
   @theme inline { --color-brand: var(--brand); --radius-card: var(--r-card); … }
   ```
   `inline` is essential — it makes `bg-brand` resolve `var(--brand)` **at the element**,
   so changing `data-theme` on `<html>` cascades to every component instantly.
3. `<html data-theme="fresh-clean">` (set from `ACTIVE_THEME`) selects which block wins.

So: **components → semantic utilities → tokens → active theme.** Change the theme, change
everything; change a token, change everywhere it's used.

---

## Common tasks

### Re-skin the entire site (one line)
Edit `ACTIVE_THEME` in **`src/lib/theme.ts`**:
```ts
export const ACTIVE_THEME: ThemeKey = "warm-grounded"; // was "fresh-clean"
```
Rebuild / redeploy. Done — every page follows the new theme.

### Tweak a theme's colors (or radii, shadows, type)
Edit that theme's `[data-theme="…"]` block in **`src/app/globals.css`**. Change the
**values only**; keep the token **names**. Preview live at `/styleguide`.
> Keep text colors AA-contrast (≥ 4.5:1 on their background). The `*-strong` tokens are the
> AA-safe variants for text/links on light surfaces — use those for small text, not the
> raw brand/accent.

### Add a new theme
1. Add `{ key: "newkey", label: "New Theme" }` to `THEMES` in `src/lib/theme.ts`.
2. Add a `[data-theme="newkey"] { … }` block in `globals.css` defining **every** token.
3. It shows up automatically in the `/styleguide` switcher.

### Change a font
Swap the loader in **`src/app/fonts.ts`**. For a **non-variable** Google font you must
list `weight: ["400", …]`. Then point the relevant `--fam-*` role at it in `globals.css`.

> **Sniglet only ships weights 400 and 800.** In themes that use Sniglet as the
> display/accent face (Playful & Vibrant, Bold & Sunny), `font-semibold`/`font-bold`
> on those elements round up to 800. The shipped **Fresh & Clean** theme uses Be Vietnam
> Pro for display (true 600/700), so it's unaffected.

---

## The token vocabulary

**Colors** (`bg-*`, `text-*`, `border-*`): `brand`, `brand-strong`, `brand-hover`,
`secondary`, `secondary-strong`, `accent`, `accent-strong`, `star`, `surface`,
`surface-2`, `panel`, `paper`, `border`, `ink`, `ink-muted`, `ink-subtle`, `on-brand`,
`on-dark-muted`.

**Radii** (`rounded-*`): `sm`, `md`, `card`, `lg`, `xl`, `pill`.
**Shadows** (`shadow-*`): `sm`, `md`, `lg`.
**Fonts** (`font-*`): `display`, `body`, `accent` (roles; the actual family differs by theme).
**Type sizes** (`text-*`): `display`, `h1`, `h2`, `h3`, `body`, `small`.

## Rules
- Never hardcode a hex value or `font-family` in a component — always use a token utility.
- Use `*-strong` color tokens for text/icons on light backgrounds (they're AA-safe).
- `data-theme` is **not** dark mode; there is no dark mode in phase 1.
