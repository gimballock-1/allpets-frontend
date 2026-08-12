import { cn } from "@/lib/cn";
import { Button } from "./Button";

export type PromoBannerProps = {
  title: string;
  /** Offer terms/qualifier — required authored content (PromotionSchema), always shown. */
  body: string;
  cta?: { label: string; href: string };
  className?: string;
};

/**
 * Slim promotion banner (8.2 ↔ 8.7) — the single source of promo-banner markup,
 * rendered by the Home hero and the Services index so the two never drift.
 * Presentational only: callers map a `Promotion` record onto these props.
 */
export function PromoBanner({ title, body, cta, className }: PromoBannerProps) {
  return (
    <div
      className={cn(
        "bg-surface-2 border-border rounded-card flex flex-wrap items-center justify-between gap-3 border px-5 py-3",
        className,
      )}
    >
      <div className="flex flex-col gap-1">
        <p className="text-ink text-small font-semibold">{title}</p>
        <p className="text-ink-muted text-small">{body}</p>
      </div>
      {cta ? (
        // Title in the accessible name — otherwise two promos with the same CTA
        // label are indistinguishable in a screen-reader links list (WCAG 2.4.4).
        <Button
          variant="ghost"
          size="sm"
          href={cta.href}
          aria-label={`${cta.label} — ${title}`}
        >
          {cta.label}
        </Button>
      ) : null}
    </div>
  );
}
