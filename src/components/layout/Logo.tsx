import Link from "next/link";
import { cn } from "@/lib/cn";

/** "All Pets" wordmark + paw glyph, links home. */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="All Pets Veterinary Hospital — home"
      className={cn("inline-flex items-center gap-2.5", className)}
    >
      <span
        aria-hidden
        className="text-brand-strong bg-panel rounded-pill grid h-9 w-9 place-items-center"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="8" cy="9" r="2.3" />
          <circle cx="16" cy="9" r="2.3" />
          <circle cx="5" cy="14.3" r="2.1" />
          <circle cx="19" cy="14.3" r="2.1" />
          <path d="M12 13c2.9 0 4.8 2.2 4.8 4.2 0 1.5-1.3 2.2-2.9 2.2-1 0-1.4-.4-1.9-.4s-.9.4-1.9.4c-1.6 0-2.9-.7-2.9-2.2C7.2 15.2 9.1 13 12 13z" />
        </svg>
      </span>
      <span className="leading-tight">
        <span className="font-display text-ink block text-h3 font-bold">All Pets</span>
        <span className="font-accent text-ink-subtle block text-small font-semibold uppercase tracking-label">
          Veterinary Hospital
        </span>
      </span>
    </Link>
  );
}
