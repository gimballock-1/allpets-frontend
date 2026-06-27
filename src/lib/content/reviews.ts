/**
 * Reviews seam (8.1) — the ONE runtime read in the otherwise build-time content
 * layer (LLD §4.4). Everything else in `./index.ts` resolves at build; this fetches
 * Google reviews from the Spring backend **through the same-origin `/api/reviews`
 * proxy** (route handler owned by 8.5 / Epic 10) so the browser never touches the
 * API origin directly and there is no cross-origin call.
 *
 * Empty-tolerant by contract (req §8.6): any failure — no host, network error,
 * non-2xx, or a shape the schema rejects — degrades to a typed-empty summary so a
 * statically-rendered page never white-screens. The Spring side owns last-cached /
 * fallback behavior (Epic 10 / 10.7); the frontend just renders what it gets.
 */
import "server-only";
import { headers } from "next/headers";
import { ReviewsSummarySchema, type ReviewsSummary } from "./schema";

/** Documented server-cache TTL (~5 min) — baseline for 8.13/12.8 perf work. */
export const REVIEWS_REVALIDATE_SECONDS = 300;

const EMPTY: ReviewsSummary = { rating: null, count: 0, reviews: [] };

export async function getReviews(): Promise<ReviewsSummary> {
  // `headers()` is read OUTSIDE the try so Next's dynamic-rendering bailout
  // (a thrown signal during static generation) propagates instead of being
  // swallowed by the catch below. Reviews are the one dynamic segment by design.
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return EMPTY;
  const proto =
    h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");

  try {
    const res = await fetch(`${proto}://${host}/api/reviews`, {
      headers: { accept: "application/json" },
      // Shield the Spring endpoint from per-visitor load; revalidate ~5 min.
      next: { revalidate: REVIEWS_REVALIDATE_SECONDS },
    });
    if (!res.ok) return EMPTY;
    const parsed = ReviewsSummarySchema.safeParse(await res.json());
    return parsed.success ? parsed.data : EMPTY;
  } catch {
    return EMPTY; // network/parse failure → graceful empty, never a crash
  }
}
