import Link from "next/link";
import { Container, SectionHeading } from "@/components/ui";
import { PersonCard } from "@/components/team/PersonCard";
import { getVets } from "@/lib/content";

/**
 * Home team teaser (8.4) — a curated preview of up to 4 vets (the bookable,
 * trust-building faces; the full team grid is on /about, 8.9). Uses the shared
 * `PersonCard` (the same component 8.9 reuses). Renders only what exists.
 */
export function TeamTeaser() {
  const vets = getVets().slice(0, 4);
  if (vets.length === 0) return null;

  return (
    <section>
      <Container className="py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Meet the team"
            title="The people caring for your pet"
            subtitle="Experienced, compassionate veterinarians who treat your pet like their own."
          />
          <Link
            href="/about"
            className="text-brand-strong shrink-0 font-semibold hover:underline"
          >
            Meet the full team <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-6">
          {vets.map((member) => (
            <div key={member.slug} className="w-full sm:w-60">
              <PersonCard member={member} headingLevel="h3" />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
