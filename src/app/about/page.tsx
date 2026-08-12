import type { Metadata } from "next";
import { Container, SectionHeading } from "@/components/ui";
import { PersonCard } from "@/components/team/PersonCard";
import { RichText } from "@/components/RichText";
import { getPage, getTeamMembers } from "@/lib/content";

/**
 * About Us "/about" (8.9) — statically generated: the `about` Page body (MDX,
 * story + values authored in content/pages/about.mdx per the issue's default)
 * through the shared RichText pipeline (8.8), then the FULL team grid — one
 * unified grid of active vets + staff in displayOrder (the Stitch layout is
 * lost, so no vet/staff split), each PersonCard in its About variant
 * (credentials + MDX bio). Page meta is authored in the entry's seo block.
 */
function aboutPage() {
  const page = getPage("about");
  // Missing content file = a build error, not a silently-shipped 404 —
  // the same fail-fast contract as the 8.1 loader (about.mdx is in-repo).
  if (!page) throw new Error("content/pages/about.mdx is missing or invalid");
  return page;
}

export function generateMetadata(): Metadata {
  const page = aboutPage();
  return {
    // Authored metaTitle is the complete tab title (it already names the
    // clinic) — absolute skips the root title.template to avoid a double
    // suffix. The fallback plain title takes the template normally.
    title: page.seo?.metaTitle
      ? { absolute: page.seo.metaTitle }
      : page.title,
    description: page.seo?.metaDescription,
  };
}

export default function AboutPage() {
  const page = aboutPage();
  const team = getTeamMembers();

  return (
    <Container className="py-16">
      <SectionHeading
        as="h1"
        size="h1"
        eyebrow="About us"
        title={page.title}
      />
      <article className="max-w-3xl">
        <RichText mdx={page.body} />
      </article>

      {team.length > 0 ? (
        <section className="mt-16">
          <SectionHeading
            eyebrow="Meet the team"
            title="The people behind the care"
            subtitle="Veterinarians and care staff who treat your pet like their own."
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member) => (
              <PersonCard
                key={member.slug}
                member={member}
                headingLevel="h3"
                showDetails
              />
            ))}
          </div>
        </section>
      ) : null}
    </Container>
  );
}
