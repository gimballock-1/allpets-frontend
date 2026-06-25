import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

export const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-pill px-3.5 py-1.5 font-accent text-small font-semibold uppercase tracking-label",
  {
    variants: {
      tone: {
        panel: "bg-panel text-brand-strong",
        brand: "bg-brand text-on-brand",
        outline: "border border-border text-ink-muted",
      },
    },
    defaultVariants: { tone: "panel" },
  },
);

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>;

/** Small pill label (eyebrows, tags, trust chips). */
export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
