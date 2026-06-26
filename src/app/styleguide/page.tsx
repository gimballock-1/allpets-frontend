import type { Metadata } from "next";
import ThemeSwitcher from "./ThemeSwitcher";
import heroPlaceholder from "@public/images/hero-placeholder.png";
import {
  Badge,
  Button,
  Hero,
  Image,
  SectionHeading,
  ServiceCard,
  TeamCard,
} from "@/components/ui";

export const metadata: Metadata = {
  title: "Design System — All Pets",
  robots: { index: false, follow: false }, // internal review page
};

/* ---- demo icons (inline SVG, currentColor) ---- */
function PawIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="8" cy="9" r="2.4" />
      <circle cx="16" cy="9" r="2.4" />
      <circle cx="5" cy="14.5" r="2.2" />
      <circle cx="19" cy="14.5" r="2.2" />
      <path d="M12 13c3 0 5 2.3 5 4.4 0 1.6-1.4 2.3-3 2.3-1 0-1.4-.4-2-.4s-1 .4-2 .4c-1.6 0-3-.7-3-2.3C7 15.3 9 13 12 13z" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
      <path d="M9 11.5l2 2 4-4" />
    </svg>
  );
}
function HeartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 20s-6.5-4.2-9-8.3C1.4 8.9 3 6 6 6c1.9 0 3 1.1 3.5 1.8C10 7.1 11.1 6 13 6c3 0 4.6 2.9 3 5.7-1 1.7-2.7 3.3-4 4.5" />
      <path d="M15 13h4M17 11v4" />
    </svg>
  );
}
function ToothIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 4c-2 0-2.5-1-4.5-1S4 5 4 8.5c0 4 1 7 2 9.5.6 1.5 1.8 1.4 2.1-.2.3-1.6.6-3.3 1.9-3.3s1.6 1.7 1.9 3.3c.3 1.6 1.5 1.7 2.1.2 1-2.5 2-5.5 2-9.5C16 5 15.5 3 13.5 3S14 4 12 4z" />
    </svg>
  );
}

function Avatar({ initials }: { initials: string }) {
  return (
    <div className="bg-secondary text-on-brand flex h-full w-full items-center justify-center font-display text-h3 font-bold">
      {initials}
    </div>
  );
}

const SERVICES = [
  { icon: <PawIcon />, name: "Wellness Exams", description: "Routine check-ups that keep tails wagging." },
  { icon: <ShieldIcon />, name: "Vaccinations", description: "Protection tailored to your pet's life stage." },
  { icon: <HeartIcon />, name: "Surgery", description: "Safe, modern surgical care with attentive recovery." },
  { icon: <ToothIcon />, name: "Dentistry", description: "Healthy teeth for happier, longer lives." },
];

const TEAM = [
  { initials: "SB", name: "Dr. Sarah Bennett", role: "Veterinarian" },
  { initials: "JC", name: "Dr. James Carter", role: "Veterinarian" },
  { initials: "ML", name: "Maria Lopez", role: "Lead Vet Technician" },
];

const COLORS: { name: string; cls: string; ring?: boolean }[] = [
  { name: "brand", cls: "bg-brand" },
  { name: "brand-strong", cls: "bg-brand-strong" },
  { name: "brand-hover", cls: "bg-brand-hover" },
  { name: "secondary", cls: "bg-secondary" },
  { name: "secondary-strong", cls: "bg-secondary-strong" },
  { name: "accent", cls: "bg-accent" },
  { name: "accent-strong", cls: "bg-accent-strong" },
  { name: "star", cls: "bg-star" },
  { name: "ink", cls: "bg-ink" },
  { name: "ink-muted", cls: "bg-ink-muted" },
  { name: "ink-subtle", cls: "bg-ink-subtle" },
  { name: "surface", cls: "bg-surface", ring: true },
  { name: "surface-2", cls: "bg-surface-2", ring: true },
  { name: "panel", cls: "bg-panel", ring: true },
  { name: "paper", cls: "bg-paper", ring: true },
  { name: "border", cls: "bg-border" },
  { name: "on-brand", cls: "bg-on-brand", ring: true },
  { name: "on-dark-muted", cls: "bg-on-dark-muted" },
];

const RADII = ["rounded-sm", "rounded-md", "rounded-card", "rounded-lg", "rounded-xl", "rounded-pill"];
const SHADOWS = ["shadow-sm", "shadow-md", "shadow-lg"];

function Label({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-accent text-ink-subtle mb-4 text-small font-bold uppercase tracking-label">
      {children}
    </h2>
  );
}

export default function StyleguidePage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12 pb-24">
      <header className="border-border mb-10 border-b pb-8">
        <p className="font-accent text-brand-strong text-small font-bold uppercase tracking-label">
          All Pets · Design System
        </p>
        <h1 className="font-display text-h1 text-ink mt-2 font-bold">
          One token layer, four themes.
        </h1>
        <p className="text-body text-ink-muted mt-3 max-w-2xl">
          Every primitive below is built from semantic tokens (Epic 7.6). Flip the theme
          to re-skin the whole page live — the shipped default is set in one place
          (<code className="text-brand-strong">src/lib/theme.ts</code>).
        </p>
        <div className="mt-6">
          <ThemeSwitcher />
        </div>
      </header>

      {/* ---- Primitives ---- */}
      <section className="mb-12">
        <Label>Buttons</Label>
        <div className="flex flex-col gap-4">
          {(["primary", "secondary", "ghost"] as const).map((variant) => (
            <div key={variant} className="flex flex-wrap items-center gap-3">
              <Button variant={variant} size="sm">Small</Button>
              <Button variant={variant} size="md">Medium</Button>
              <Button variant={variant} size="lg">Large</Button>
            </div>
          ))}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button variant="primary" href="/styleguide">Link button (renders &lt;a&gt;)</Button>
            <Button variant="secondary" disabled>Disabled</Button>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <Label>Badges</Label>
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone="panel">Norman, Oklahoma</Badge>
          <Badge tone="brand">Open 6 days</Badge>
          <Badge tone="outline">Fear-Free certified</Badge>
        </div>
      </section>

      <section className="mb-12">
        <Label>Section heading</Label>
        <SectionHeading
          as="h3"
          eyebrow="What we do"
          title="Compassionate care, end to end"
          subtitle="The title's semantic level and visual size are independent, so heading order stays valid on every page."
        />
      </section>

      <section className="mb-12">
        <Label>Service cards</Label>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((s) => (
            <ServiceCard
              key={s.name}
              icon={s.icon}
              name={s.name}
              description={s.description}
              href="/styleguide"
            />
          ))}
        </div>
      </section>

      <section className="mb-12">
        <Label>Team cards</Label>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {TEAM.map((t) => (
            <TeamCard key={t.name} media={<Avatar initials={t.initials} />} name={t.name} role={t.role} />
          ))}
        </div>
      </section>

      <section className="mb-12">
        <Label>Hero block</Label>
        <div className="rounded-card border-border bg-surface-2 border px-6">
          <Hero
            titleAs="h2"
            eyebrow="Norman, Oklahoma"
            title="Compassionate care for every paw, claw & whisker."
            subtitle="From wellness exams to surgery — modern, gentle veterinary care, booked online in minutes."
            primaryCta={{ label: "Book a Visit", href: "/styleguide" }}
            secondaryCta={{ label: "Explore Services", href: "/styleguide" }}
            media={
              <Image
                src={heroPlaceholder}
                alt="Illustration of a friendly dog and cat"
                fill
                placeholder="blur"
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            }
          />
        </div>
      </section>

      {/* ---- Tokens ---- */}
      <section className="mb-12">
        <Label>Color tokens</Label>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {COLORS.map((c) => (
            <figure key={c.name} className="m-0">
              <div className={`${c.cls} ${c.ring ? "border-border border" : ""} rounded-card h-16 w-full`} />
              <figcaption className="text-ink-subtle mt-1.5 text-small">{c.name}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <Label>Type ramp &amp; fonts</Label>
        <div className="rounded-card border-border bg-paper shadow-sm divide-border divide-y border">
          <p className="font-display text-display text-ink m-0 px-5 py-4 font-bold leading-display">Display — font-display</p>
          <p className="font-display text-h1 text-ink m-0 px-5 py-4 font-bold">Heading 1 — text-h1</p>
          <p className="font-display text-h2 text-ink m-0 px-5 py-4 font-semibold">Heading 2 — text-h2</p>
          <p className="text-h3 text-ink m-0 px-5 py-4 font-semibold">Heading 3 — text-h3</p>
          <p className="text-body text-ink-muted m-0 px-5 py-4">Body — text-body / font-body. The quick brown fox jumps over the lazy dog.</p>
          <p className="text-small text-ink-subtle m-0 px-5 py-4">Small — text-small. Muted captions and metadata.</p>
          <p className="font-accent text-ink m-0 px-5 py-4 text-h3 font-bold">Accent face — font-accent</p>
        </div>
      </section>

      <section className="mb-12">
        <Label>Radii</Label>
        <div className="flex flex-wrap gap-5">
          {RADII.map((r) => (
            <figure key={r} className="m-0">
              <div className={`${r} bg-secondary border-border h-16 w-16 border`} />
              <figcaption className="text-ink-subtle mt-1.5 text-small">{r}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section>
        <Label>Elevation</Label>
        <div className="flex flex-wrap gap-6">
          {SHADOWS.map((s) => (
            <figure key={s} className="m-0">
              <div className={`${s} bg-paper rounded-card border-border h-20 w-32 border`} />
              <figcaption className="text-ink-subtle mt-2 text-small">{s}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}
