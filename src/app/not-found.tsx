import type { Metadata } from "next";
import { Button, Container } from "@/components/ui";
import { BOOK_HREF } from "@/components/layout/nav";

export const metadata: Metadata = { title: "Page not found" };

/**
 * Branded 404 (8.12) — rendered for unmatched routes and every `notFound()`
 * call (8.8 unknown service slugs, 8.11 missing legal content). Server
 * Component inside the root layout, so header/footer navigation stays, and the
 * App Router serves it with a real HTTP 404 (no soft-404, req §8.6/12.x).
 */
export default function NotFound() {
  return (
    <Container className="py-24 text-center">
      <p className="font-accent text-brand-strong text-small font-bold uppercase tracking-label">
        Error 404
      </p>
      <h1 className="font-display text-h1 text-ink mt-3 font-bold">
        We couldn&rsquo;t sniff out that page
      </h1>
      <p className="text-body text-ink-muted mx-auto mt-4 max-w-xl">
        The page you&rsquo;re looking for may have moved, or it never existed. Let&rsquo;s get
        you back to something helpful.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button href="/">Back to Home</Button>
        <Button href={BOOK_HREF} variant="secondary">
          Book a Visit
        </Button>
      </div>
    </Container>
  );
}
