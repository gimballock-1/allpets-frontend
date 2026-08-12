import type { Metadata } from "next";
import { Container, PhoneLink, PromoBanner, SectionHeading } from "@/components/ui";
import { ServiceCard } from "@/components/services/ServiceCard";
import { getActivePromotions, getServices, getSite } from "@/lib/content";

// Interim until 12.1 standardizes per-page meta site-wide (canonical, OG).
// The clinic-name suffix comes from the root layout's title.template.
export const metadata: Metadata = {
  title: "Our Services",
  description:
    "Preventive, dental, surgical, and wellness care for dogs and cats in Norman, Oklahoma. Explore every service we offer — all bookable online.",
};

/**
 * Services index "/services" (8.7) — a Server Component listing ALL active services
 * (no top-N cap, unlike the Home bento) in displayOrder via the 8.1 loader, each
 * rendered through the shared content-aware `ServiceCard` (8.3) linking to
 * `/services/{slug}` (8.8). Active Services-placed promotions surface above the
 * grid; nothing renders when none are in window.
 */
export default function ServicesPage() {
  const services = getServices();
  const promotions = getActivePromotions("services");

  return (
    <Container className="py-16">
      <SectionHeading
        as="h1"
        size="h1"
        eyebrow="What we do"
        title="Our Services"
        subtitle="Comprehensive care for dogs and cats at every stage of life — preventive, dental, surgical, and more. Every service is bookable online."
      />

      {promotions.length > 0 ? (
        <div className="mt-8 flex flex-col gap-3">
          {promotions.map((promo) => (
            <PromoBanner
              key={promo.id}
              title={promo.title}
              body={promo.body}
              cta={promo.cta}
            />
          ))}
        </div>
      ) : null}

      {services.length > 0 ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.slug} service={service} headingLevel="h2" />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </Container>
  );
}

/** No active services (content authoring gap) — point visitors at the phone line. */
function EmptyState() {
  const { phone, phoneE164 } = getSite();
  return (
    <p className="text-body text-ink-muted mt-10 max-w-2xl">
      We&rsquo;re updating our list of services right now. Please call us at{" "}
      <PhoneLink
        phone={phone}
        phoneE164={phoneE164}
        className="text-brand-strong font-semibold"
      />{" "}
      and we&rsquo;ll be happy to help.
    </p>
  );
}
