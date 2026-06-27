import Link from "next/link";
import { cn } from "@/lib/cn";

type HeadingLevel = "h2" | "h3" | "h4";

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Adds a hover elevation (for clickable cards). */
  interactive?: boolean;
};

/** Base surface card: paper, hairline border, card radius, soft shadow. */
export function Card({ className, interactive, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-card border border-border bg-paper p-6 shadow-sm",
        interactive && "transition-shadow hover:shadow-md",
        className,
      )}
      {...props}
    />
  );
}

export type ServiceCardProps = {
  /** Decorative icon (rendered inside an IconBox by the caller, or pass an svg). */
  icon: React.ReactNode;
  name: string;
  description: string;
  /** "Learn more" target (service detail page). */
  href?: string;
  /** Accessible name for the "Learn more" link — distinguishes otherwise-identical
   *  links in a screen-reader links list (WCAG 2.4.4). */
  linkAriaLabel?: string;
  /** Semantic heading level for the service name — keep heading order valid. */
  headingLevel?: HeadingLevel;
  className?: string;
};

/** Service overview card (Epic 8.3): icon, name, blurb, "Learn more". */
export function ServiceCard({
  icon,
  name,
  description,
  href,
  linkAriaLabel,
  headingLevel: Heading = "h3",
  className,
}: ServiceCardProps) {
  return (
    <Card
      interactive={Boolean(href)}
      className={cn("flex flex-col gap-3", className)}
    >
      <span
        aria-hidden
        className="text-brand-strong bg-panel rounded-md inline-flex h-11 w-11 items-center justify-center"
      >
        {icon}
      </span>
      <Heading className="font-display text-h3 text-ink font-bold">{name}</Heading>
      <p className="text-body text-ink-muted">{description}</p>
      {href ? (
        <Link
          href={href}
          aria-label={linkAriaLabel}
          className="text-brand-strong mt-auto pt-1 font-semibold"
        >
          Learn more <span aria-hidden="true">→</span>
        </Link>
      ) : null}
    </Card>
  );
}

export type TeamCardProps = {
  /** Photo slot — the 7.13 image component plugs in here (placeholder until then). */
  media: React.ReactNode;
  name: string;
  role: string;
  headingLevel?: HeadingLevel;
  className?: string;
};

/** Team member card (Epic 8.4): circular photo, name, role. */
export function TeamCard({
  media,
  name,
  role,
  headingLevel: Heading = "h3",
  className,
}: TeamCardProps) {
  return (
    <Card className={cn("flex flex-col items-center gap-3 text-center", className)}>
      <div className="bg-panel shadow-sm rounded-pill h-24 w-24 overflow-hidden">
        {media}
      </div>
      <div>
        <Heading className="font-display text-h3 text-ink font-bold">{name}</Heading>
        <p className="font-accent text-small text-brand-strong mt-1 font-semibold uppercase tracking-label">
          {role}
        </p>
      </div>
    </Card>
  );
}
