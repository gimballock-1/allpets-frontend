// Primary nav (req §3). Shared by the desktop header and the mobile drawer.
export const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

/** Booking CTA target. 9.2 wires the click handler + `booking-started` event. */
export const BOOK_HREF = "/book";
