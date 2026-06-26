# allpets-frontend

The **Next.js** marketing site for **All Pets Veterinary Hospital** (phase 1). Serves
**file-based content** (typed TypeScript + MDX committed in this repo, no CMS), embeds
Cal.com booking, and ships privacy-respecting Plausible analytics. The contact form and
Google-reviews block reach the **Spring backend** (`api.allpets.kinvee.in`) through a
**same-origin `/api` route-handler proxy**. Deploys to the `quasar` k3s cluster
(namespace `allpets-frontend`, host `allpets.kinvee.in`).

## Develop

Stack: **Next.js 16** (App Router) · **React 19** · **TypeScript** (strict) · **pnpm** ·
**Node 24 LTS** (pinned in `.nvmrc` / `engines`) · **Tailwind CSS v4** (CSS-first via
`@tailwindcss/postcss` — design tokens live in `@theme` in `src/app/globals.css`, no
`tailwind.config.js`).

```bash
corepack enable          # provides the pinned pnpm (see packageManager)
pnpm install
pnpm dev                 # http://localhost:3000
```

Scripts: `pnpm dev` · `pnpm build` (produces the `output: 'standalone'` runner the 7.8
Dockerfile ships) · `pnpm start` · `pnpm lint` · `pnpm typecheck` (`tsc --noEmit`). CI
(15.3) runs typecheck + lint + build; the build fails on type errors (not suppressed).

## Environment

Copy **[`.env.example`](.env.example)** → `.env.local` and fill in the values; access them
through the typed, fail-fast **`src/env.ts`** (`publicEnv` / `apiBase()`). None are secrets.

- **`NEXT_PUBLIC_*`** (Cal.com URL, Plausible domain + script URL) are **inlined at build
  time** — set as repo *variables* → `--build-arg` → `ARG`/`ENV` in the 7.8 Dockerfile.
  ⚠️ Changing one needs a **rebuild**, not just a redeploy.
- **`API_BASE`** (Spring backend) is **server-only runtime** env — changeable **without a
  rebuild**; the browser only calls same-origin `/api/*`, never the Spring host directly.
- Content is **file-based** (Epic 8) — there is **no** content-API env var.

## Design docs

- **[Design system](docs/design-system.md)** — the multi-theme token layer (single source of truth: `ACTIVE_THEME` in `src/lib/theme.ts`); how to re-skin the whole site from one place. Preview all themes live at `/styleguide`.
- **[Frontend LLD](planning/lld-frontend.md)** — App Router structure, file-based content (typed TS + MDX, build-time SSG), the same-origin `/api` proxy to the Spring backend, local `public/` assets via `next/image`, Cal.com embed, SEO/a11y/perf, the k8s ingress fold-in.
- **[System architecture (HLD)](https://github.com/gimballock-1/allpets-backend/blob/main/planning/architecture.md)** — the system spine (lives in the `allpets-backend` repo).
- **[Backend LLD](https://github.com/gimballock-1/allpets-backend/blob/main/planning/lld-backend.md)** — the data model + API surface this site consumes.

> A full developer quickstart is tracked in issue 17.8.
