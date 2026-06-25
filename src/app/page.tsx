import Link from "next/link";

// Placeholder home route — the real layout (7.5) and pages (Epic 8) build on the
// shell. This intentionally uses ONLY semantic design-system utilities (bg-*, text-*,
// font-*, rounded-*, shadow-*) so it re-skins with the active theme with zero edits.
export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col items-start justify-center gap-6 px-6 py-16">
      <span className="font-accent rounded-pill bg-panel text-brand-strong px-4 py-1.5 text-small font-semibold tracking-wide">
        Norman, Oklahoma
      </span>

      <h1 className="font-display text-display text-ink font-bold leading-[1.05]">
        Compassionate care for every paw, claw &amp; whisker.
      </h1>

      <p className="text-body text-ink-muted max-w-xl">
        Website coming soon. The design system shell is live — this page is rendered
        entirely from semantic design tokens, so it follows whichever theme is active.
      </p>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/styleguide"
          className="rounded-pill bg-brand text-on-brand shadow-md hover:bg-brand-hover px-6 py-3 font-semibold transition-colors"
        >
          View the design system →
        </Link>
        <a
          href="#"
          className="rounded-pill border-border text-ink hover:bg-panel border bg-paper px-6 py-3 font-semibold transition-colors"
        >
          Book a Visit
        </a>
      </div>
    </main>
  );
}
