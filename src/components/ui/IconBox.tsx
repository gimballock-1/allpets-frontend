import { cn } from "@/lib/cn";

export type IconBoxProps = React.HTMLAttributes<HTMLSpanElement> & {
  children: React.ReactNode;
};

/**
 * Tinted rounded tile that holds a decorative icon (e.g. service-card icons).
 * `aria-hidden` by default — the accompanying text label carries the meaning.
 */
export function IconBox({ className, children, ...props }: IconBoxProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center rounded-md bg-panel text-brand-strong",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
