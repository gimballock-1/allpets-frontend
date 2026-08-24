/** target/rel are the component's whole point — callers can't override them. */
export type ExternalLinkProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "target" | "rel"
>;

/**
 * New-tab link with a consistent announcement (12.10/F3, WCAG 3.2.4/G201) —
 * the one place same-behavior "leaves the site in a new tab" links get
 * identified, using the convention StaticMap established: "(opens in new
 * tab)" in the accessible name. With an `aria-label` the hint is folded into
 * the label (a child span would be ignored — aria-label replaces contents);
 * otherwise it's appended as a visually-hidden span after the visible text.
 * Always `rel="noopener noreferrer"` (the pre-existing convention, now
 * unforgettable).
 */
export function ExternalLink({
  "aria-label": ariaLabel,
  children,
  ...props
}: ExternalLinkProps) {
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel ? `${ariaLabel} (opens in new tab)` : undefined}
      {...props}
    >
      {children}
      {ariaLabel ? null : <span className="sr-only"> (opens in new tab)</span>}
    </a>
  );
}
