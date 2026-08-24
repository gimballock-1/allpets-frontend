# syntax=docker/dockerfile:1@sha256:ecfaec9ed6d810b56388c508f4121597bfbba70d41a6dfeee4d8cad5f295fc32
#
# Multi-stage image for the allpets Next.js marketing site (issue 7.8).
# Build context = repo root:  docker build -f deploy/Dockerfile -t allpets-frontend .
#
# Ships the Next.js `output: "standalone"` server (next.config.ts) — a trimmed
# node_modules + server.js, ~10x smaller than copying the full tree. Mirrors the
# proven local-ai-proxy frontend image and the AarogyaFrontend reuse reference,
# adapted to this repo's toolchain: pnpm@11.7.0 (corepack) on Node 24.
#
# TWO ENV KINDS (see .env.example / src/env.ts, 7.9):
#   • NEXT_PUBLIC_*  — inlined into the bundle at BUILD time → ARG→ENV here, BEFORE
#     `pnpm build`. The defaults below ARE the production values and must mirror
#     .env.example (all public, all skpodduturi.dev); CD (15.3) deliberately passes
#     no NEXT_PUBLIC --build-args (repo-variable overrides only if a value ever
#     diverges). Changing one needs a REBUILD, not just a redeploy.
#   • API_BASE       — SERVER-ONLY runtime env (src/env.server.ts). NOT a build arg;
#     set as plain container env in the Deployment (changeable without a rebuild).
#
# Base images are digest-pinned (14.8): the tag stays for readability, the @sha256
# digest is what actually resolves — an upstream re-tag can't silently change the
# build. Dependabot (docker ecosystem, .github/dependabot.yml) bumps the digests
# weekly so pinning never means staleness. CD runs a Trivy image scan before
# deploy. No ":latest" anywhere.

# ---- base: pnpm via corepack ------------------------------------------------
FROM node:24-alpine@sha256:d32cdf619f63fe0471182d08996dd516c6275bb5fd31ae06e55a570bd9e1ad43 AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
# corepack ships with Node; it pins pnpm to package.json's `packageManager` field.
RUN corepack enable
WORKDIR /app

# ---- deps: install with a frozen lockfile (cached on its own layer) ----------
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile

# ---- build: compile the standalone server -----------------------------------
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time public config (NEXT_PUBLIC_*). Defaults mirror .env.example; the
# env validators (src/lib/env-validators.ts) fail the build on a missing/malformed
# value, so a broken value never ships silently.
ARG NEXT_PUBLIC_CALCOM_URL=https://book.allpets.skpodduturi.dev
ARG NEXT_PUBLIC_PLAUSIBLE_DOMAIN=allpets.skpodduturi.dev
ARG NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL=https://analytics.allpets.skpodduturi.dev/js/script.js
ENV NEXT_PUBLIC_CALCOM_URL=$NEXT_PUBLIC_CALCOM_URL \
    NEXT_PUBLIC_PLAUSIBLE_DOMAIN=$NEXT_PUBLIC_PLAUSIBLE_DOMAIN \
    NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL=$NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL \
    NEXT_TELEMETRY_DISABLED=1

RUN pnpm build

# ---- runner: minimal non-root runtime ---------------------------------------
FROM node:24-alpine@sha256:d32cdf619f63fe0471182d08996dd516c6275bb5fd31ae06e55a570bd9e1ad43 AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1

# Fixed numeric uid/gid so the kubelet can verify non-root even when the pod
# securityContext pins runAsUser (deploy/k8s/deployment.yaml uses 10001).
RUN addgroup --system --gid 10001 nodejs \
    && adduser --system --uid 10001 --ingroup nodejs nextjs

# The runtime never invokes the npm CLI (CMD is `node server.js`), so drop it
# from the final image: its bundled deps (tar, undici, brace-expansion,
# ip-address) are recurring CVE sources that would otherwise ship for nothing
# and trip the CD Trivy image gate (14.8). corepack stays — tiny, unused at
# runtime, and advisory-free; only npm's vendored tree is the noise source.
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

# Provenance for /api/health (7.11) + the info surface. Injected per deploy by CD
# (15.3): `--build-arg GIT_SHA=<sha> --build-arg BUILD_TIME=<iso8601>`.
ARG GIT_SHA=dev
ARG BUILD_TIME=unknown
ENV GIT_SHA=$GIT_SHA \
    BUILD_TIME=$BUILD_TIME

# standalone bundle + assets. `public` and `.next/static` are NOT part of the
# standalone output and must be copied alongside it (Next.js requirement).
COPY --from=build /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
# File-based marketing content (8.1): the MDX getters read content/ with `fs`. It is
# baked into static HTML at build, but ship it here too (a few KB) so the getters stay
# correct on any dynamic render (an unlisted dynamicParams slug, reviews co-location).
COPY --from=build /app/content ./content

USER 10001:10001
EXPOSE 3000

# The on-demand image optimizer writes to /app/.next/cache at runtime; with a
# read-only root FS (deploy/k8s) that path is an emptyDir mount.
CMD ["node", "server.js"]
