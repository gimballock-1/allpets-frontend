import type { Metadata } from "next";
import ThemeSwitcher from "./ThemeSwitcher";

export const metadata: Metadata = {
  title: "Design System — All Pets",
  robots: { index: false, follow: false }, // internal review page
};

// Literal class names (Tailwind scans source statically — never build class names
// dynamically, e.g. `bg-${name}`, or they get purged).
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

const RADII = [
  { name: "rounded-sm", cls: "rounded-sm" },
  { name: "rounded-md", cls: "rounded-md" },
  { name: "rounded-card", cls: "rounded-card" },
  { name: "rounded-lg", cls: "rounded-lg" },
  { name: "rounded-xl", cls: "rounded-xl" },
  { name: "rounded-pill", cls: "rounded-pill" },
];

const SHADOWS = [
  { name: "shadow-sm", cls: "shadow-sm" },
  { name: "shadow-md", cls: "shadow-md" },
  { name: "shadow-lg", cls: "shadow-lg" },
];

function Label({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-accent text-ink-subtle mb-4 text-small font-bold uppercase tracking-label">
      {children}
    </h2>
  );
}

export default function StyleguidePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 pb-24">
      <header className="border-border mb-10 border-b pb-8">
        <p className="font-accent text-brand-strong text-small font-bold uppercase tracking-label">
          All Pets · Design System
        </p>
        <h1 className="font-display text-h1 text-ink mt-2 font-bold">
          One token layer, four themes.
        </h1>
        <p className="text-body text-ink-muted mt-3 max-w-2xl">
          Everything below is rendered only from semantic design tokens. Flip the
          theme to re-skin the whole page live — the shipped default is set in one
          place (<code className="text-brand-strong">src/lib/theme.ts</code>).
        </p>
        <div className="mt-6">
          <ThemeSwitcher />
        </div>
      </header>

      {/* Colors */}
      <section className="mb-12">
        <Label>Color tokens</Label>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {COLORS.map((c) => (
            <figure key={c.name} className="m-0">
              <div
                className={`${c.cls} ${c.ring ? "border-border border" : ""} rounded-card h-16 w-full`}
              />
              <figcaption className="text-ink-subtle mt-1.5 text-small">
                {c.name}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Type ramp */}
      <section className="mb-12">
        <Label>Type ramp &amp; fonts</Label>
        <div className="rounded-card border-border bg-paper shadow-sm divide-border divide-y border">
          <p className="font-display text-display text-ink m-0 px-5 py-4 font-bold leading-tight">
            Display — font-display
          </p>
          <p className="font-display text-h1 text-ink m-0 px-5 py-4 font-bold">
            Heading 1 — text-h1
          </p>
          <p className="font-display text-h2 text-ink m-0 px-5 py-4 font-semibold">
            Heading 2 — text-h2
          </p>
          <p className="text-h3 text-ink m-0 px-5 py-4 font-semibold">
            Heading 3 — text-h3
          </p>
          <p className="text-body text-ink-muted m-0 px-5 py-4">
            Body — text-body / font-body. The quick brown fox jumps over the lazy dog.
          </p>
          <p className="text-small text-ink-subtle m-0 px-5 py-4">
            Small — text-small. Muted captions and metadata.
          </p>
          <p className="font-accent text-ink m-0 px-5 py-4 text-h3 font-bold">
            Accent face — font-accent (Sniglet / Be&nbsp;Vietnam&nbsp;Pro by theme)
          </p>
        </div>
      </section>

      {/* Buttons */}
      <section className="mb-12">
        <Label>Buttons</Label>
        <div className="flex flex-wrap items-center gap-3">
          <button className="rounded-pill bg-brand text-on-brand shadow-md hover:bg-brand-hover px-6 py-3 font-semibold transition-colors">
            Book a Visit
          </button>
          <button className="rounded-pill border-border bg-paper text-ink hover:bg-panel border px-6 py-3 font-semibold transition-colors">
            Our Services
          </button>
          <button className="rounded-pill text-brand-strong hover:bg-panel px-6 py-3 font-semibold transition-colors">
            Learn more →
          </button>
        </div>
      </section>

      {/* Radii */}
      <section className="mb-12">
        <Label>Radii</Label>
        <div className="flex flex-wrap gap-5">
          {RADII.map((r) => (
            <figure key={r.name} className="m-0">
              <div
                className={`${r.cls} bg-secondary border-border h-16 w-16 border`}
              />
              <figcaption className="text-ink-subtle mt-1.5 text-small">
                {r.name}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Shadows / elevation */}
      <section className="mb-12">
        <Label>Elevation</Label>
        <div className="flex flex-wrap gap-6">
          {SHADOWS.map((s) => (
            <figure key={s.name} className="m-0">
              <div
                className={`${s.cls} bg-paper rounded-card border-border h-20 w-32 border`}
              />
              <figcaption className="text-ink-subtle mt-2 text-small">
                {s.name}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Sample card */}
      <section>
        <Label>Composed sample</Label>
        <article className="rounded-card border-border bg-paper shadow-md max-w-sm border p-6">
          <div className="bg-panel text-brand-strong rounded-md mb-4 inline-flex h-11 w-11 items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <circle cx="8" cy="9" r="2.4" />
              <circle cx="16" cy="9" r="2.4" />
              <circle cx="5" cy="14.5" r="2.2" />
              <circle cx="19" cy="14.5" r="2.2" />
              <path d="M12 13c3 0 5 2.3 5 4.4 0 1.6-1.4 2.3-3 2.3-1 0-1.4-.4-2-.4s-1 .4-2 .4c-1.6 0-3-.7-3-2.3C7 15.3 9 13 12 13z" />
            </svg>
          </div>
          <h3 className="font-display text-h3 text-ink font-bold">Wellness Exams</h3>
          <p className="text-body text-ink-muted mt-1.5">
            Routine check-ups that keep tails wagging.
          </p>
          <button className="text-brand-strong mt-4 font-semibold">Learn more →</button>
        </article>
      </section>
    </main>
  );
}
