"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui";
import { NavLink } from "./NavLink";
import { NAV_ITEMS, BOOK_HREF } from "./nav";

/**
 * Mobile nav drawer built on the native <dialog> element: `showModal()` gives
 * us focus trapping, Esc-to-close, and focus-return-to-invoker for free — the
 * accessible behavior req §8.1 demands, without a hand-rolled trap.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  // Close when a navigation COMMITS (pathname change) rather than on link
  // click: on a cold tap (prefetch miss) the drawer stays up and the tapped
  // link's pending dot is the progress feedback — instead of the drawer
  // vanishing onto a seemingly dead page (12.8 review P2). Same-route taps
  // never change the pathname; NavLink closes those on click itself.
  // (dialog.close() on an already-closed dialog — e.g. this effect's initial
  // run — is a spec'd no-op.)
  useEffect(() => {
    ref.current?.close();
  }, [pathname]);

  function openDrawer() {
    ref.current?.showModal();
    setOpen(true);
  }
  function closeDrawer() {
    ref.current?.close();
  }

  // Close when the click lands on the ::backdrop (outside the drawer panel rect).
  function onDialogClick(e: React.MouseEvent<HTMLDialogElement>) {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const inside =
      e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if (!inside) closeDrawer();
  }

  // Keep `open` in sync when the dialog closes via Esc, backdrop, or .close().
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const onClose = () => setOpen(false);
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, []);

  // Lock background scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={openDrawer}
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label="Open menu"
        className="text-ink hover:bg-panel rounded-md inline-flex h-10 w-10 items-center justify-center"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <dialog
        id="mobile-nav"
        ref={ref}
        aria-label="Menu"
        onClick={onDialogClick}
        className="text-ink m-0 ml-auto h-dvh max-h-dvh w-[min(20rem,86vw)] max-w-none bg-paper p-6 shadow-lg"
      >
        <div className="mb-6 flex items-center justify-between">
          <span className="font-display text-ink text-h3 font-bold">Menu</span>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close menu"
            className="text-ink hover:bg-panel rounded-md inline-flex h-10 w-10 items-center justify-center"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <nav aria-label="Mobile" className="flex flex-col gap-1">
          {/* prefetch: these links are display:none until the drawer opens, so
              Next's default viewport-entry prefetch never fires for them —
              prefetch on mount instead (a handful of small static RSC payloads)
              so a tap navigates from cache even on a cold mobile visit. */}
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} {...item} prefetch pendingIndicator onNavigate={closeDrawer} />
          ))}
        </nav>

        {/* TODO(9.2): fire the `booking-started` Plausible event on click. */}
        <Button href={BOOK_HREF} onClick={closeDrawer} className="mt-6 w-full">
          Book a Visit
        </Button>
      </dialog>
    </div>
  );
}
