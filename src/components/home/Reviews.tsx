import { Card, Container, ExternalLink, SectionHeading } from "@/components/ui";
import { getSite, type Review, type ReviewsSummary } from "@/lib/content";
import { googleMapsUrl } from "@/lib/maps";
import { cn } from "@/lib/cn";

/** Render at most 6 reviews regardless of what the summary carries (req §4.1). */
const MAX_REVIEWS = 6;

const STAR_PATH =
  "M12 2.6l2.8 5.8 6.4.9-4.6 4.5 1.1 6.4-5.7-3-5.7 3 1.1-6.4L2.8 9.3l6.4-.9z";

/** "4.9" / "5" — one decimal only when the value has one, so the visible text
 *  and the star `aria-label` always announce the same thing. */
function formatRating(rating: number): string {
  return Number.isInteger(rating) ? String(rating) : rating.toFixed(1);
}

/**
 * Accessible star rating (req §8.1): the exact value lives in one `aria-label`
 * ("Rated 4.9 out of 5"); the glyphs are decorative and hidden from readers.
 * Filled vs unfilled is solid-vs-hollow (shape, not color alone — WCAG 1.4.1)
 * and every star carries an `ink-subtle` outline, which clears the 3:1
 * non-text contrast floor on all four theme surfaces (WCAG 1.4.11).
 */
function Stars({ rating, className }: { rating: number; className?: string }) {
  const filled = Math.round(rating);
  return (
    <span
      role="img"
      aria-label={`Rated ${formatRating(rating)} out of 5`}
      className={cn("flex items-center gap-0.5", className)}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          strokeLinejoin="round"
          aria-hidden="true"
          className={cn(
            "stroke-ink-subtle",
            i <= filled ? "fill-star" : "fill-transparent",
          )}
        >
          <path d={STAR_PATH} />
        </svg>
      ))}
    </span>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <Card className="flex h-full flex-col gap-4">
      <Stars rating={review.rating} />
      <blockquote className="text-body text-ink-muted">
        &ldquo;{review.text}&rdquo;
      </blockquote>
      <div className="mt-auto flex items-center gap-3 pt-2">
        {/* Initial-letter avatar — no remote photos in the POC (author photo
            remotePatterns land with the live wiring, #90). */}
        <span
          aria-hidden="true"
          className="bg-panel text-ink font-accent text-small flex h-10 w-10 shrink-0 items-center justify-center rounded-pill font-bold"
        >
          {/* Spread is astral-safe (charAt would split a surrogate pair) and
              the schema doesn't forbid an empty author. */}
          {[...review.author][0]?.toUpperCase() ?? "•"}
        </span>
        <div>
          <p className="text-small text-ink font-semibold">{review.author}</p>
          {review.relativeTime ? (
            <p className="text-small text-ink-subtle">{review.relativeTime}</p>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

/**
 * Home Google-reviews section (8.5, req §4.1/§6.2) — prop-driven so the data
 * source is the caller's choice: the POC hands it the placeholder fixture
 * (`getReviewsMock()`); #90 swaps that call to the runtime `getReviews()`
 * without touching this component. An empty summary renders nothing — Home
 * must never block or break on reviews (req §6.2 failure mode).
 */
export function Reviews({ summary }: { summary: ReviewsSummary }) {
  if (summary.reviews.length === 0) return null;
  const site = getSite();
  const reviews = summary.reviews.slice(0, MAX_REVIEWS);

  return (
    <section className="bg-surface-2 border-border border-y">
      <Container className="py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Reviews"
            title="What pet parents say"
            subtitle="A few recent reviews from the families who visit us."
          />
          {summary.rating !== null ? (
            <div className="shrink-0">
              <Stars rating={summary.rating} />
              <p className="text-small text-ink-muted mt-1">
                <span className="text-ink font-semibold">
                  {formatRating(summary.rating)} out of 5
                </span>
                {summary.count > 0 ? (
                  <>
                    {" "}
                    · {summary.count} Google {summary.count === 1 ? "review" : "reviews"}
                  </>
                ) : null}
              </p>
            </div>
          ) : null}
        </div>

        <ul className="mt-10 grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review, i) => (
            <li key={`${review.author}-${i}`}>
              <ReviewCard review={review} />
            </li>
          ))}
        </ul>

        {/* Link text matches the destination (a Maps name+address search);
            #90 upgrades it to a place_id URL once Epic 10's Place ID lands. */}
        <p className="text-small text-ink-subtle mt-8 text-center">
          Reviews are from our Google listing —{" "}
          <ExternalLink
            href={googleMapsUrl(site)}
            className="hover:text-ink underline underline-offset-2"
          >
            open in Google Maps
          </ExternalLink>
          .
        </p>
      </Container>
    </section>
  );
}
