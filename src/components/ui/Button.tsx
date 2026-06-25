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

type CommonProps = VariantProps<typeof buttonVariants> & {
  className?: string;
  children?: React.ReactNode;
};

/**
 * Discriminated union: with `href` it renders a Next <Link> (anchor attributes,
 * no `disabled`/button `type`); without it, a <button>. So nav CTAs are real
 * links and you can't accidentally `disabled` an anchor.
 */
export type ButtonProps =
  | (CommonProps &
      Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & {
        href?: undefined;
      })
  | (CommonProps &
      Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & {
        href: string;
      });

export function Button({ variant, size, className, ...props }: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size }), className);

  if (props.href !== undefined) {
    return <Link className={classes} {...props} />;
  }

  const { type = "button", ...rest } = props;
  return <button type={type} className={classes} {...rest} />;
}
