import { Container, Hero, Image } from "@/components/ui";
import heroPlaceholder from "@public/images/hero-placeholder.png";

// Placeholder home route — the real pages (Epic 8) build on the shell. Composed
// from 7.6 primitives + semantic tokens. The hero image is a local public/ asset
// (7.7): static-imported so next/image gets intrinsic dimensions + a blur placeholder.
export default function Home() {
  return (
    <Container>
      <Hero
        eyebrow="Norman, Oklahoma"
        title="Compassionate care for every paw, claw & whisker."
        subtitle="Website coming soon. The design-system shell is live — this page is built from the 7.6 UI primitives and semantic tokens."
        primaryCta={{ label: "View the design system", href: "/styleguide" }}
        media={
          <Image
            src={heroPlaceholder}
            alt="Illustration of a friendly dog and cat"
            fill
            preload
            placeholder="blur"
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        }
      />
    </Container>
  );
}
