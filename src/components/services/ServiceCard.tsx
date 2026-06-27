import { ServiceCard as ServiceCardBase } from "@/components/ui";
import type { Service } from "@/lib/content";
import { serviceIcon } from "./serviceIcons";

export type ServiceCardProps = {
  service: Service;
  /** Keep document heading order valid for the consuming section (a11y). */
  headingLevel?: "h2" | "h3" | "h4";
};

/**
 * Content-aware service card (8.3 ↔ 8.7) — the single source of service-card markup.
 * Maps a `Service` (8.1 loader) onto the presentational `ui/ServiceCard`: resolves
 * the icon glyph and the `/services/{slug}` detail link. The Home grid (8.3) and the
 * Services index (8.7) both render this so the card never drifts.
 */
export function ServiceCard({ service, headingLevel }: ServiceCardProps) {
  return (
    <ServiceCardBase
      icon={serviceIcon(service.icon)}
      name={service.title}
      description={service.shortDescription}
      href={`/services/${service.slug}`}
      headingLevel={headingLevel}
    />
  );
}
