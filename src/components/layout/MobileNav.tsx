"use client";

import { useEffect, useRef, useState } from "react";
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

  function openDrawer() {
    ref.current?.showModal();
    setOpen(true);
  }
  function closeDrawer() {
    ref.current?.close();
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
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} {...item} onNavigate={closeDrawer} />
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
