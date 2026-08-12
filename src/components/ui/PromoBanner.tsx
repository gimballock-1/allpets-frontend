import { cn } from "@/lib/cn";
import { Button } from "./Button";

export type PromoBannerProps = {
  title: string;
  /** Both must be present for the CTA to render. */
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
};

/**
 * Slim promotion banner (8.2 ↔ 8.7) — the single source of promo-banner markup,
 * rendered by the Home hero and the Services index so the two never drift.
 * Presentational only: callers map a `Promotion` record onto these props.
 */
export function PromoBanner({ title, ctaLabel, ctaHref, className }: PromoBannerProps) {
  return (
    <div
      className={cn(
        "bg-surface-2 border-border rounded-card flex flex-wrap items-center justify-between gap-3 border px-5 py-3",
        className,
      )}
    >
      <p className="text-ink text-small font-semibold">{title}</p>
      {ctaLabel && ctaHref ? (
        <Button variant="ghost" size="sm" href={ctaHref}>
          {ctaLabel}
        </Button>
      ) : null}
    </div>
  );
}
