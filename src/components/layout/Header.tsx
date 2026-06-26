import { Button, Container } from "@/components/ui";
import { Logo } from "./Logo";
import { NavLink } from "./NavLink";
import { MobileNav } from "./MobileNav";
import { NAV_ITEMS, BOOK_HREF } from "./nav";

/** Sticky site header: logo, primary nav, Book CTA, and the mobile drawer. */
export function Header() {
  return (
    <header className="border-border bg-paper/90 sticky top-0 z-40 border-b backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>

        <div className="hidden md:block">
          {/* TODO(9.2): fire the `booking-started` Plausible event on click. */}
          <Button href={BOOK_HREF} size="sm">
            Book a Visit
          </Button>
        </div>

        <MobileNav />
      </Container>
    </header>
  );
}
