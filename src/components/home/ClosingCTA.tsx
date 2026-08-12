import { Button, Container, PhoneLink } from "@/components/ui";
import { BOOK_HREF } from "@/components/layout/nav";
import { getSite } from "@/lib/content";

/**
 * Home closing CTA (8.6) — a brand band that ends the page with the two ways to
 * book: the online "Book a Visit" button (→ /book, embed is 9.1) and a `tel:` phone
 * link sourced from SiteSetting. Heading is a semantic <h2> (page order: hero h1 →
 * sections h2), sized up for prominence.
 */
export function ClosingCTA() {
  const { phone, phoneE164 } = getSite();

  return (
    <section className="bg-brand text-on-brand">
      <Container className="flex flex-col items-center gap-6 py-16 text-center">
        <h2 className="font-display text-h1 font-bold leading-tight">
          Ready to book your pet&rsquo;s visit?
        </h2>
        <p className="text-body max-w-xl">
          Schedule online in a couple of minutes, or give us a call — we&rsquo;d
          love to meet your pet.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          <Button variant="secondary" size="lg" href={BOOK_HREF}>
            Book a Visit
          </Button>
          <PhoneLink
            phone={phone}
            phoneE164={phoneE164}
            className="text-h3 font-semibold underline underline-offset-4"
          >
            Call {phone}
          </PhoneLink>
        </div>
      </Container>
    </section>
  );
}
