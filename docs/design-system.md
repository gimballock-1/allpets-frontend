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
**Other** : `leading-display`, `tracking-label`.

## Rules
- Never hardcode a hex value or `font-family` in a component — always use a token utility.
- Use `*-strong` color tokens for text/icons on light backgrounds (they're AA-safe).
- `data-theme` is **not** dark mode; there is no dark mode in phase 1.

## Components (UI primitives — Epic 7.6)

Reusable primitives live in **`src/components/ui/`** and are re-exported from
`@/components/ui`. Pages (Epic 8) compose these instead of re-styling markup.

| Primitive | Notes |
|-----------|-------|
| `Button` | `variant` primary/secondary/ghost × `size` sm/md/lg. Pass `href` to render a real `<Link>` (nav CTAs); otherwise a `<button>`. |
| `Card` · `ServiceCard` · `TeamCard` | Base surface card + the Service (icon/name/blurb/"Learn more") and Team (photo/name/role) shapes. Image slots take a `media`/`icon` node — the 7.13 image component plugs in there. |
| `SectionHeading` | `eyebrow`/`title`/`subtitle`; `as` sets the **semantic** heading level, `size` the visual size (decoupled, so heading order stays valid). |
| `Hero` | eyebrow + headline + subcopy + CTAs + above-the-fold `media` slot. |
| `Container` · `Badge` · `IconBox` | Layout wrapper, pill label, decorative icon tile. |

**Convention:** variants are defined with **`class-variance-authority`** (`cva`) over
token utilities, and classes are merged with **`cn()`** (`src/lib/cn.ts` =
`twMerge(clsx(...))`). To add a variant, extend the component's `cva` map — don't
fork the component. Every interactive primitive is keyboard-focusable (global
`:focus-visible`) with a text label. Preview them all at **`/styleguide`**.

## Images (Epic 7.7 + 7.13)

Marketing images are **local assets committed under `public/images/`** (content is
file-based — there is no media database or MinIO origin in phase 1).

- **Loader & formats:** Next's built-in optimizer over local/static assets (the default),
  serving **AVIF/WebP** with fallback (`images.formats`, negotiated via the `Accept` header).
  `deviceSizes` are tuned to the project breakpoints (360/768/1280/1920 + retina; Next's giant
  2048/3840 are dropped) so the optimizer doesn't generate unused variants on quasar (2.12). No
  `remotePatterns` — no remote media origin in phase 1. **CPU fallback:** if on-the-fly
  optimization is too heavy on the co-tenant node, commit pre-sized `public/` assets instead.
- **Use the `<Image>` wrapper** from `@/components/ui` (not raw `next/image`) — it requires `alt`,
  applies a default `sizes` (so mobile doesn't over-fetch), lazy-loads by default, and rides the
  AVIF/WebP + responsive srcset config. Prefer **static import** for free dims + blur:
  ```tsx
  import { Image } from "@/components/ui";
  import hero from "@public/images/hero-placeholder.png"; // @public → ./public

  <Image src={hero} alt="…" fill placeholder="blur" sizes="(min-width:768px) 50vw, 100vw" />
  ```
  A static import gives intrinsic **width/height** + an automatic **`blurDataURL`**. Use a path
  string + explicit `width`/`height` only when you must. Same asset in dev and prod.
- **Above-the-fold images** (the hero LCP element) take `preload` (Next 16; `priority` is deprecated);
  everything else lazy-loads by default.
- **CLS:** always pass `fill` + a positioned/aspect container, or `width`/`height`, so images
  reserve space (CLS < 0.1).
- **Icons stay inline** React/SVG components — they do **not** go through `next/image`, so
  `dangerouslyAllowSVG` stays off (no SVG-via-Image CSP concern).
