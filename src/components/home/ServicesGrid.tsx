import Link from "next/link";
import { Container, SectionHeading } from "@/components/ui";
import { ServiceCard } from "@/components/services/ServiceCard";
import { getServices } from "@/lib/content";

/**
 * Home services overview (8.3) — a responsive grid of active services from the 8.1
 * loader (already filtered + ordered by displayOrder), each linking to its detail
 * page via the shared `ServiceCard` (the same component 8.7 reuses). Renders nothing
 * when there are no active services; renders only as many cards as exist (no padding).
 */
export function ServicesGrid() {
  const services = getServices();
  if (services.length === 0) return null;

  return (
    <section className="bg-surface-2 border-border border-y">
      <Container className="py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="What we do"
            title="Services for every stage of life"
            subtitle="Comprehensive care for dogs and cats — preventive, dental, surgical, and more."
          />
          <Link
            href="/services"
            className="text-brand-strong shrink-0 font-semibold hover:underline"
          >
            See all services →
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <ServiceCard key={service.slug} service={service} headingLevel="h3" />
          ))}
        </div>
      </Container>
    </section>
  );
}
