"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

export type NavLinkProps = {
  href: string;
  label: string;
  /** Called after navigation (e.g. to close the mobile drawer). */
  onNavigate?: () => void;
  className?: string;
};

/** Nav link with active state (`aria-current="page"`) from the current route. */
export function NavLink({ href, label, onNavigate, className }: NavLinkProps) {
  const pathname = usePathname();
  // Segment-aware so /services-foo doesn't mark /services active.
  const active =
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-pill px-3 py-2 font-semibold transition-colors",
        active
          ? "text-brand-strong bg-panel"
          : "text-ink-muted hover:text-ink hover:bg-panel",
        className,
      )}
    >
      {label}
    </Link>
  );
}
