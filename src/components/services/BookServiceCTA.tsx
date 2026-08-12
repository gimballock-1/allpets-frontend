import { Button } from "@/components/ui";
import type { Service } from "@/lib/content";

/**
 * "Book this service" CTA slot (8.8) — 9.3 owns the deep-link resolution
 * (vet × `eventTypeSlug`, multi-vet disambiguation, dead-link guard) and will
 * replace this component's body. Until then it routes to the generic /book
 * flow. Do NOT hard-code a Cal.com URL here (6.16).
 */
export function BookServiceCTA({ service }: { service: Service }) {
  return (
    <Button size="lg" href="/book" aria-label={`Book ${service.title}`}>
      Book this service
    </Button>
  );
}
