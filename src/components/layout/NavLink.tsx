"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

export type NavLinkProps = {
  href: string;
  label: string;
  /**
   * Force route prefetch on MOUNT instead of Next's default on-viewport-entry.
   * The mobile drawer needs this: its links sit inside a closed `<dialog>`
   * (display:none), so the viewport observer never fires and a cold tap would
   * navigate with nothing cached (12.8 review P2).
   */
  prefetch?: boolean;
  /**
   * Show an in-link pending dot (absolutely positioned — no layout shift)
   * while a navigation started from this link is in flight. Pair with a caller
   * that keeps the link visible until the route commits (the drawer).
   */
  pendingIndicator?: boolean;
  /**
   * Drawer-close hook. Called on click ONLY when the click cannot change the
   * route (already on this exact page); route-changing clicks leave the caller
   * open so the pending indicator stays visible, and the caller closes itself
   * when the pathname actually changes (see MobileNav).
   */
  onNavigate?: () => void;
  className?: string;
};

/** Progress feedback for slow/cold navigations (12.8 review P2) — must live in
 *  a child component: `useLinkStatus` only works inside the owning <Link>. */
function PendingDot() {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden="true"
      className={cn(
        "absolute right-3 top-1/2 size-2 -translate-y-1/2 rounded-full bg-current transition-opacity",
        pending ? "opacity-60 motion-safe:animate-pulse" : "opacity-0",
      )}
    />
  );
}

/** Nav link with active state (`aria-current="page"`) from the current route. */
export function NavLink({
  href,
  label,
  prefetch,
  pendingIndicator,
  onNavigate,
  className,
}: NavLinkProps) {
  const pathname = usePathname();
  // Segment-aware so /services-foo doesn't mark /services active.
  const active =
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      prefetch={prefetch}
      onClick={() => {
        // Exact-match clicks don't navigate, so no pathname change will ever
        // close the drawer — close it here. Route-changing clicks are closed
        // by the caller's pathname effect instead (keeps the pending dot
        // visible on a cold navigation). Without an indicator, keep the old
        // close-on-click behavior.
        if (!pendingIndicator || pathname === href) onNavigate?.();
      }}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-pill px-3 py-2 font-semibold transition-colors",
        pendingIndicator && "relative",
        active
          ? "text-brand-strong bg-panel"
          : "text-ink-muted hover:text-ink hover:bg-panel",
        className,
      )}
    >
      {label}
      {pendingIndicator ? <PendingDot /> : null}
    </Link>
  );
}
