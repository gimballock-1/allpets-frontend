export type PhoneLinkProps = {
  /** Display form, e.g. "(405) 555-0123" (SiteSetting.phone). */
  phone: string;
  /** Dialable E.164 (SiteSetting.phoneE164) — becomes the `tel:` target. */
  phoneE164: string;
  className?: string;
  /** Link text; defaults to the display number. */
  children?: React.ReactNode;
};

/**
 * `tel:` dial link — one source for the tel:{E.164} + display-number pairing,
 * rendered by the footer, the closing CTA, and page empty states.
 */
export function PhoneLink({ phone, phoneE164, className, children }: PhoneLinkProps) {
  return (
    <a href={`tel:${phoneE164}`} className={className}>
      {children ?? phone}
    </a>
  );
}
