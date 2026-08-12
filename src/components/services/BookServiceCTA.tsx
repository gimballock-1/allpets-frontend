import { Button } from "@/components/ui";
import { BOOK_HREF } from "@/components/layout/nav";
import type { Service } from "@/lib/content";

/**
 * "Book this service" CTA slot (8.8) — 9.3 owns the deep-link resolution
 * (vet × `eventTypeSlug`, multi-vet disambiguation, dead-link guard) and will
 * replace this component's body. Until then it routes to the shared BOOK_HREF
 * flow. Do NOT hard-code a Cal.com URL here (6.16).
 */
export function BookServiceCTA({ service }: { service: Service }) {
  return (
    // Visible text leads the accessible name (WCAG 2.5.3 Label in Name) —
    // the service suffix distinguishes CTAs in a screen-reader links list.
    <Button
      size="lg"
      href={BOOK_HREF}
      aria-label={`Book this service — ${service.title}`}
    >
      Book this service
    </Button>
  );
}
