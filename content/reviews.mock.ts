import type { ReviewsSummary } from "@/lib/content/schema";

/**
 * ⚠️ PLACEHOLDER Google-reviews fixture (8.5 mock-first, POC decision 2026-08-22).
 * Every review below is FABRICATED sample content — not a real customer quote.
 * It exists so Home shows the final reviews design before the Google Places
 * setup (10.1/10.2) is unparked.
 *
 * #90 (Post-POC · wire live Google data) is the tracked LAUNCH BLOCKER that
 * deletes this file and swaps Home to the runtime `getReviews()` — this content
 * must never ship past the POC. Edit freely for the demo; keep `rating`/`count`
 * plausible against the authored reviews.
 */
export const reviewsMock: ReviewsSummary = {
  rating: 4.9,
  count: 127,
  reviews: [
    {
      author: "Emily R.",
      rating: 5,
      text: "The whole team was wonderful with our anxious lab. They explained every step of his dental cleaning and called the next morning to check on him.",
      relativeTime: "2 weeks ago",
    },
    {
      author: "Marcus T.",
      rating: 5,
      text: "We've trusted All Pets with our two cats for years. Appointments run on time and you can tell everyone here genuinely loves animals.",
      relativeTime: "a month ago",
    },
    {
      author: "Dana W.",
      rating: 5,
      text: "They squeezed our puppy in same-day when he ate something he shouldn't have. Calm, kind, and upfront about costs the whole way through.",
      relativeTime: "3 weeks ago",
    },
    {
      author: "Priya S.",
      rating: 5,
      text: "Clean clinic, friendly front desk, and the vet took real time answering my questions instead of rushing us out the door.",
      relativeTime: "2 months ago",
    },
    {
      author: "Kevin M.",
      rating: 4,
      text: "Great with our senior beagle's arthritis plan. Only wish weekend slots were a little easier to get.",
      relativeTime: "3 months ago",
    },
    {
      author: "Alyssa G.",
      rating: 5,
      text: "From the first wellness visit to a scary late-night emergency referral, they've been fantastic every single time.",
      relativeTime: "a month ago",
    },
  ],
};
