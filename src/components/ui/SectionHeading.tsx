import { cn } from "@/lib/cn";

type HeadingLevel = "h1" | "h2" | "h3" | "h4";
type TitleSize = "display" | "h1" | "h2" | "h3";

const SIZE_CLASS: Record<TitleSize, string> = {
  display: "text-display",
  h1: "text-h1",
  h2: "text-h2",
  h3: "text-h3",
};

export type SectionHeadingProps = {
  /** Optional kicker above the title. */
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Semantic heading tag — set this to keep document heading order valid (a11y). */
  as?: HeadingLevel;
  /** Visual size, decoupled from the semantic level. */
  size?: TitleSize;
  align?: "left" | "center";
  className?: string;
};

/**
 * Eyebrow + title + subtitle. The title's semantic level (`as`) is decoupled
 * from its visual `size` so heading order stays valid regardless of styling.
 * Title uses the `font-display` token (the active theme's display face).
 */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  as: Tag = "h2",
  size = "h2",
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow ? (
        <span className="font-accent text-brand-strong text-small font-bold uppercase tracking-label">
          {eyebrow}
        </span>
      ) : null}
      <Tag className={cn("font-display text-ink font-bold", SIZE_CLASS[size])}>
        {title}
      </Tag>
      {subtitle ? (
        <p className="text-body text-ink-muted max-w-2xl">{subtitle}</p>
      ) : null}
    </div>
  );
}
