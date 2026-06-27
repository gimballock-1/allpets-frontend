import type { PromotionInput } from "@/lib/content/schema";

/**
 * Date-windowed promotions (8.1) — surfaced by getActivePromotions(placement),
 * which filters to active + in-window for the requested placement (Home / Services).
 * Empty is fine: pages render no promo banner when nothing is active.
 *
 * ⚠️ PROVISIONAL sample. Edit + commit to change; `startsAt`/`endsAt` are ISO 8601
 * (omit a side for unbounded). Remove this sample once real promotions exist.
 */
export const promotions: PromotionInput[] = [
  {
    id: "new-patient-2026",
    title: "New patient? Your first wellness exam is on us.",
    body: "Book a wellness visit online and mention you're new — we'll waive the first exam fee.",
    placement: "home",
    active: true,
    startsAt: "2026-01-01T00:00:00Z",
    endsAt: "2026-12-31T23:59:59Z",
    ctaLabel: "Book a visit",
    ctaHref: "/book",
  },
];
