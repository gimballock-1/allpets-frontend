# allpets-frontend

The **Next.js** marketing site for **All Pets Veterinary Hospital** (phase 1). Serves
**file-based content** (typed TypeScript + MDX committed in this repo, no CMS), embeds
Cal.com booking, and ships privacy-respecting Plausible analytics. The contact form and
Google-reviews block reach the **Spring backend** (`api.allpets.skpodduturi.dev`) through a
**same-origin `/api` route-handler proxy**. Deploys to the `quasar` k3s cluster
(namespace `allpets-frontend`, host `allpets.skpodduturi.dev`).

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
through the typed, fail-fast modules: **`publicEnv`** (`src/env.ts`) and **`apiBase()`**
(`src/env.server.ts`, `server-only`). None are secrets.

- **`NEXT_PUBLIC_*`** (Cal.com URL, Plausible domain + script URL) are **inlined at build
  time** — set as repo *variables* → `--build-arg` → `ARG`/`ENV` in the 7.8 Dockerfile.
  ⚠️ Changing one needs a **rebuild**, not just a redeploy.
- **`API_BASE`** (Spring backend) is **server-only runtime** env — changeable **without a
  rebuild**; the browser only calls same-origin `/api/*`, never the Spring host directly.
- Content is **file-based** (Epic 8) — there is **no** content-API env var.

## Local full-stack dev ([`compose.yaml`](compose.yaml))

Marketing content is **file-based**, so pages render with **no backend** — for content work
just run `pnpm dev`. You only need the backend stack to exercise the same-origin proxy
routes (`/api/contact`, `/api/reviews`). Three tiers:

| You want to… | Run | Notes |
|---|---|---|
| Render file-based pages | `pnpm dev` | no compose; http://localhost:3000 |
| + exercise `/api/*` proxy routes | `docker compose up` (db + api), then `pnpm dev` | set `API_BASE=http://localhost:8080` in `.env.local` |
| Run everything in containers | `docker compose --profile web up` | `web` reaches `api` at `http://api:8080` automatically |
| + object storage (optional) | add `--profile minio` | console http://localhost:9001 |

Teardown: **`docker compose down -v`** (removes the stack's named volumes — no orphans).
⚠️ The Postgres init script (extensions) runs **only on a fresh data dir** — if you had a
`pgdata` volume from before this change, run `docker compose down -v` once to re-init, or
the extensions will be missing and backend migrations may fail.

**Spring backend image.** `api` defaults to `ghcr.io/gimballock-1/allpets-api:main` — the
package may be **private**, so `docker login ghcr.io` first, **or** override
`ALLPETS_API_IMAGE`, **or** uncomment the `build:` block (needs a sibling
`../allpets-backend` checkout), **or** skip the `api` service and run the backend with
`./gradlew bootRun` in that repo while `docker compose up db` provides Postgres only.

**Cross-repo coupling.** The **canonical** backend compose is owned by **Epic 20**
(`allpets-backend`); this file *mirrors* its topology — `postgres:16.4` on **:5432**
(`appdb`/`app_svc` + the same extensions), Spring on **:8080**, MinIO on **:9000/:9001** —
read from the backend k8s manifests. The two repos must **agree on these host ports**; do
**not** run both composes simultaneously (they fight for `:5432`/`:8080`). Defaults
(`POSTGRES_PASSWORD`, `MINIO_ROOT_*`) are dev-only — override via shell env / `.env`.

## Design docs

- **[Design system](docs/design-system.md)** — the multi-theme token layer (single source of truth: `ACTIVE_THEME` in `src/lib/theme.ts`); how to re-skin the whole site from one place. Preview all themes live at `/styleguide`.
- **[Frontend LLD](planning/lld-frontend.md)** — App Router structure, file-based content (typed TS + MDX, build-time SSG), the same-origin `/api` proxy to the Spring backend, local `public/` assets via `next/image`, Cal.com embed, SEO/a11y/perf, the k8s ingress fold-in.
- **[System architecture (HLD)](https://github.com/gimballock-1/allpets-backend/blob/main/planning/architecture.md)** — the system spine (lives in the `allpets-backend` repo).
- **[Backend LLD](https://github.com/gimballock-1/allpets-backend/blob/main/planning/lld-backend.md)** — the data model + API surface this site consumes.

> A full developer quickstart is tracked in issue 17.8.
