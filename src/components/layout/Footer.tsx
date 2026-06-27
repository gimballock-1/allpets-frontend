import Link from "next/link";
import { Container } from "@/components/ui";
import { Logo } from "./Logo";
import { NAV_ITEMS, BOOK_HREF } from "./nav";
import { getSite } from "@/lib/content";
import { groupHours } from "@/lib/hours";

const QUICK_LINKS = [...NAV_ITEMS, { label: "Book a Visit", href: BOOK_HREF }];

/** Inline social glyphs by platform (keeps `dangerouslyAllowSVG` off). Unknown
 *  platforms fall back to a generic link glyph. */
const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  facebook: (
    <path d="M14 9h2V6h-2c-1.7 0-3 1.3-3 3v2H9v3h2v6h3v-6h2.2l.8-3H14v-2c0-.6.4-1 1-1z" />
  ),
  instagram: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="3.4" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="17" cy="7" r="1.2" />
    </>
  ),
};
const GENERIC_SOCIAL = (
  <path
    d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1M14 11a5 5 0 0 0-7.1 0l-2 2a5 5 0 0 0 7.1 7.1l1.1-1.1"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  />
);

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-accent text-ink mb-3 text-small font-bold uppercase tracking-label">
        {title}
      </h2>
      {children}
    </div>
  );
}

/**
 * Site-wide footer (7.5 shell, populated by 8.6) — all values come from the
 * file-based SiteSetting (8.1 `getSite()`), so editing content/site.ts updates the
 * footer on every page. Server Component; rendered once per page via layout.tsx.
 */
export function Footer() {
  const site = getSite();
  const { address } = site;
  const year = new Date().getFullYear();
  const addressLine = `${address.street}, ${address.city}, ${address.state} ${address.zip}`;
  const directionsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${site.clinicName}, ${addressLine}`,
  )}`;
  const hours = groupHours(site.hours);

  return (
    <footer className="border-border bg-surface-2 border-t">
      <Container className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-4">
          <Logo />
          <p className="text-small text-ink-muted max-w-xs">{site.tagline}</p>
          {site.socials.length > 0 ? (
            <div className="flex gap-2">
              {site.socials.map((s) => (
                <Link
                  key={s.url}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.platform}
                  className="text-ink-muted hover:text-ink hover:bg-panel border-border rounded-md inline-flex h-9 w-9 items-center justify-center border"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    {SOCIAL_ICONS[s.platform.toLowerCase()] ?? GENERIC_SOCIAL}
                  </svg>
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        <FooterCol title="Quick links">
          <ul className="flex flex-col gap-2">
            {QUICK_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-small text-ink-muted hover:text-ink">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </FooterCol>

        <FooterCol title="Contact">
          <address className="text-small text-ink-muted flex flex-col gap-2 not-italic">
            <span>{addressLine}</span>
            <a
              href={directionsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ink"
            >
              Get directions <span aria-hidden="true">→</span>
            </a>
            <a href={`tel:${site.phoneE164}`} className="hover:text-ink">
              {site.phone}
            </a>
            <a href={`mailto:${site.email}`} className="hover:text-ink">
              {site.email}
            </a>
          </address>
        </FooterCol>

        <FooterCol title="Hours">
          <dl className="text-small text-ink-muted flex flex-col gap-2">
            {hours.map((h) => (
              <div key={h.label} className="flex justify-between gap-4">
                <dt>{h.label}</dt>
                <dd className={h.closed ? "text-ink-subtle" : undefined}>{h.value}</dd>
              </div>
            ))}
          </dl>
        </FooterCol>
      </Container>

      <div className="border-border border-t">
        <Container className="text-small text-ink-subtle flex flex-col items-center justify-between gap-3 py-5 sm:flex-row">
          <p>
            © {year} {site.clinicName}
          </p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-ink">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-ink">
              Terms
            </Link>
          </div>
        </Container>
      </div>
    </footer>
  );
}
