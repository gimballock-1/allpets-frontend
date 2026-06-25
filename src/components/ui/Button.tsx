import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

/**
 * Button variant classes (the 7.6 convention: CVA + token utilities).
 * Focus rings come from the global `:focus-visible` rule in globals.css.
 */
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-pill font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
  {
    variants: {
      variant: {
        primary: "bg-brand text-on-brand shadow-md hover:bg-brand-hover",
        secondary: "border border-border bg-paper text-ink hover:bg-panel",
        ghost: "text-brand-strong hover:bg-panel",
      },
      size: {
        sm: "px-4 py-2 text-small",
        md: "px-6 py-3",
        lg: "px-8 py-4 text-h3",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

/**
 * Renders a <button> by default, or a Next <Link> when `href` is set — so nav
 * CTAs (e.g. header "Book a Visit") are real links, not JS-only buttons.
 */
export type ButtonProps = VariantProps<typeof buttonVariants> &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color"> & {
    /** When set, the button renders as a Next.js link. */
    href?: string;
    target?: string;
    rel?: string;
  };

export function Button({
  variant,
  size,
  className,
  href,
  target,
  rel,
  type,
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size }), className);

  if (href !== undefined) {
    return (
      <Link
        href={href}
        target={target}
        rel={rel}
        className={classes}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      />
    );
  }

  return <button type={type ?? "button"} className={classes} {...props} />;
}
