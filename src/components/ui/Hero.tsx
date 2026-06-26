import { Button } from "./Button";
import { Badge } from "./Badge";
import { cn } from "@/lib/cn";

// CTAs are navigational — href is required so we never render an inert control.
type Cta = { label: string; href: string };

export type HeroProps = {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  primaryCta?: Cta;
  secondaryCta?: Cta;
  /** Above-the-fold image slot — the 7.13 image component (with `priority`)
   *  plugs in here as the LCP element (placeholder until 7.13 lands). */
  media?: React.ReactNode;
  /** Semantic level for the hero headline (defaults to the page's h1). */
  titleAs?: "h1" | "h2";
  className?: string;
};

/** Marketing hero (consumed by Epic 8.2): eyebrow, headline, subcopy, CTAs, image. */
export function Hero({
  eyebrow,
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  media,
  titleAs: Title = "h1",
  className,
}: HeroProps) {
  return (
    <section
      className={cn(
        "py-12 md:py-20",
        media
          ? "grid items-center gap-10 md:grid-cols-2 md:gap-12"
          : "flex flex-col",
        className,
      )}
    >
      <div className="flex flex-col items-start gap-6">
        {eyebrow ? <Badge>{eyebrow}</Badge> : null}
        <Title className="font-display text-display text-ink font-bold leading-display">
          {title}
        </Title>
        {subtitle ? (
          <p className="text-body text-ink-muted max-w-xl">{subtitle}</p>
        ) : null}
        {(primaryCta || secondaryCta) && (
          <div className="flex flex-wrap gap-3">
            {primaryCta ? (
              <Button variant="primary" size="lg" href={primaryCta.href}>
                {primaryCta.label}
              </Button>
            ) : null}
            {secondaryCta ? (
              <Button variant="secondary" size="lg" href={secondaryCta.href}>
                {secondaryCta.label}
              </Button>
            ) : null}
          </div>
        )}
      </div>

      {media ? (
        <div className="rounded-xl bg-panel shadow-lg relative aspect-[4/3] w-full overflow-hidden">
          {media}
        </div>
      ) : null}
    </section>
  );
}
