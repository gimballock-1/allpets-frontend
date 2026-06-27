/**
 * Reviews seam (8.1) — the ONE runtime read in the otherwise build-time content
 * layer (LLD §4.4). Everything else in `./index.ts` resolves at build; this is the
 * **server-render** path: a Server Component calls `getReviews()`, which fetches the
 * Spring backend **server-to-server** using the server-only `apiBase()` (the same
 * host the `/api/reviews` proxy targets). The browser is never involved, so there is
 * no cross-origin browser call and the API origin is not exposed to the client.
 *
 * (The same-origin `/api/reviews` route handler, 8.5/Epic 10, is the *client-island*
 * variant for fully-static-shell rendering; this getter is its server-side twin.)
 *
 * NOT derived from request headers — the outbound origin comes from trusted server
 * config (`API_BASE`), never a reflected `Host`/`X-Forwarded-*` header.
 *
 * Empty-tolerant by contract (req §8.6): any failure — missing API_BASE, network
 * error, timeout, non-2xx, or a shape the schema rejects — degrades to a typed-empty
 * summary so a page never white-screens. The Spring side owns last-cached/fallback
 * behavior (Epic 10 / 10.7). `API_BASE` is a server runtime var (not a build arg), so
 * at build time this resolves empty; reviews fill in once rendered with the env set
 * (a dynamic/revalidated segment — 8.5 owns the render strategy).
 */
import "server-only";
import { apiBase } from "@/env.server";
import { ReviewsSummarySchema, type ReviewsSummary } from "./schema";

/** Documented server-cache TTL (~5 min) — baseline for 8.13/12.8 perf work. */
export const REVIEWS_REVALIDATE_SECONDS = 300;
/** Bound the render: a hung backend must degrade to empty, not hang the request. */
const REVIEWS_TIMEOUT_MS = 2500;

const EMPTY: ReviewsSummary = { rating: null, count: 0, reviews: [] };

export async function getReviews(): Promise<ReviewsSummary> {
  try {
    const res = await fetch(`${apiBase()}/reviews`, {
      headers: { accept: "application/json" },
      // Shield the Spring endpoint from per-visitor load; revalidate ~5 min.
      next: { revalidate: REVIEWS_REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(REVIEWS_TIMEOUT_MS),
    });
    if (!res.ok) return EMPTY;
    const parsed = ReviewsSummarySchema.safeParse(await res.json());
    return parsed.success ? parsed.data : EMPTY;
  } catch {
    return EMPTY; // missing env / network / timeout / parse → graceful empty
  }
}
