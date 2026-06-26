import { Container, Hero } from "@/components/ui";

// Placeholder home route — the real layout (7.5) and pages (Epic 8) build on the
// shell. Composed entirely from 7.6 primitives + semantic tokens, so it follows
// whichever theme is active with zero edits.
export default function Home() {
  return (
    <Container>
      <Hero
        eyebrow="Norman, Oklahoma"
        title="Compassionate care for every paw, claw & whisker."
        subtitle="Website coming soon. The design-system shell is live — this page is built from the 7.6 UI primitives and semantic tokens."
        primaryCta={{ label: "View the design system", href: "/styleguide" }}
      />
    </Container>
  );
}
