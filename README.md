# allpets-frontend

The **Next.js** marketing site for **All Pets Veterinary Hospital** (phase 1). Serves
**file-based content** (typed TypeScript + MDX committed in this repo, no CMS), embeds
Cal.com booking, and ships privacy-respecting Plausible analytics. The contact form and
Google-reviews block reach the **Spring backend** (`api.allpets.kinvee.in`) through a
**same-origin `/api` route-handler proxy**. Deploys to the `quasar` k3s cluster
(namespace `allpets-frontend`, host `allpets.kinvee.in`).

## Develop

Stack: **Next.js 16** (App Router) · **React 19** · **TypeScript** (strict) · **pnpm** ·
**Node 24 LTS** (pinned in `.nvmrc` / `engines`). Tailwind v4 is added in 7.2.

```bash
corepack enable          # provides the pinned pnpm (see packageManager)
pnpm install
pnpm dev                 # http://localhost:3000
```

Scripts: `pnpm dev` · `pnpm build` (produces the `output: 'standalone'` runner the 7.8
Dockerfile ships) · `pnpm start` · `pnpm lint` · `pnpm typecheck` (`tsc --noEmit`). CI
(15.3) runs typecheck + lint + build; the build fails on type errors (not suppressed).

## Design docs

- **[Frontend LLD](planning/lld-frontend.md)** — App Router structure, file-based content (typed TS + MDX, build-time SSG), the same-origin `/api` proxy to the Spring backend, local `public/` assets via `next/image`, Cal.com embed, SEO/a11y/perf, the k8s ingress fold-in.
- **[System architecture (HLD)](https://github.com/gimballock-1/allpets-backend/blob/main/planning/architecture.md)** — the system spine (lives in the `allpets-backend` repo).
- **[Backend LLD](https://github.com/gimballock-1/allpets-backend/blob/main/planning/lld-backend.md)** — the data model + API surface this site consumes.

> A full developer quickstart is tracked in issue 17.8.
