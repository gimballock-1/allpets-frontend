import Link from "next/link";
import { Container } from "@/components/ui";
import { Logo } from "./Logo";
import { NAV_ITEMS, BOOK_HREF } from "./nav";

/**
 * PLACEHOLDER content (`data-placeholder` on each block) — 8.6 binds these to the
 * file-based site-settings content module. Do not treat as real clinic data.
 */
const SITE = {
  mission: "Compassionate veterinary care for every paw, claw & whisker in Norman, Oklahoma.",
  address: "123 W Main St, Norman, OK 73069",
  phone: "(405) 555-0123",
  email: "hello@allpetsnorman.com",
  hours: [
    { day: "Mon – Fri", time: "8am – 6pm" },
    { day: "Saturday", time: "9am – 2pm" },
    { day: "Sunday", time: "Closed" },
  ],
} as const;

const QUICK_LINKS = [...NAV_ITEMS, { label: "Book a Visit", href: BOOK_HREF }];

const SOCIAL = [
  {
    label: "Facebook",
    icon: (
      <path d="M14 9h2V6h-2c-1.7 0-3 1.3-3 3v2H9v3h2v6h3v-6h2.2l.8-3H14v-2c0-.6.4-1 1-1z" />
    ),
  },
  {
    label: "Instagram",
    icon: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="3.4" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="17" cy="7" r="1.2" />
      </>
    ),
  },
] as const;

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

export function Footer() {
  const year = new Date().getFullYear();
  const telHref = `tel:${SITE.phone.replace(/[^\d+]/g, "")}`;

  return (
    <footer className="border-border bg-surface-2 border-t">
      <Container className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-4">
          <Logo />
          <p className="text-small text-ink-muted max-w-xs" data-placeholder>
            {SITE.mission}
          </p>
          <div className="flex gap-2">
            {SOCIAL.map((s) => (
              <Link
                key={s.label}
                href="#"
                aria-label={`${s.label} (placeholder)`}
                data-placeholder
                className="text-ink-muted hover:text-ink hover:bg-panel border-border rounded-md inline-flex h-9 w-9 items-center justify-center border"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  {s.icon}
                </svg>
              </Link>
            ))}
          </div>
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
          <address className="text-small text-ink-muted flex flex-col gap-2 not-italic" data-placeholder>
            <span>{SITE.address}</span>
            <a href={telHref} className="hover:text-ink">{SITE.phone}</a>
            <a href={`mailto:${SITE.email}`} className="hover:text-ink">{SITE.email}</a>
          </address>
        </FooterCol>

        <FooterCol title="Hours">
          <dl className="text-small text-ink-muted flex flex-col gap-2" data-placeholder>
            {SITE.hours.map((h) => (
              <div key={h.day} className="flex justify-between gap-4">
                <dt>{h.day}</dt>
                <dd>{h.time}</dd>
              </div>
            ))}
          </dl>
        </FooterCol>
      </Container>

      <div className="border-border border-t">
        <Container className="text-small text-ink-subtle flex flex-col items-center justify-between gap-3 py-5 sm:flex-row">
          <p>© {year} All Pets Veterinary Hospital</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-ink">Privacy</Link>
            <Link href="/terms" className="hover:text-ink">Terms</Link>
          </div>
        </Container>
      </div>
    </footer>
  );
}
