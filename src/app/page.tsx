import { Hero } from "@/components/home/Hero";
import { ServicesGrid } from "@/components/home/ServicesGrid";
import { TeamTeaser } from "@/components/home/TeamTeaser";
import { Reviews } from "@/components/home/Reviews";
import { ClosingCTA } from "@/components/home/ClosingCTA";
import { VeterinaryCareJsonLd } from "@/components/seo/VeterinaryCareJsonLd";
import { getReviewsMock } from "@/lib/content";

/**
 * Home "/" (Epic 8) — a Server Component composing the file-based, build-time
 * sections (8.2–8.6). Each section reads the 8.1 content getters and is
 * statically generated. Page metadata is 12.1.
 */
export default function Home() {
  return (
    <>
      <VeterinaryCareJsonLd />
      <Hero />
      <ServicesGrid />
      <TeamTeaser />
      {/* 8.5 mock-first (#20): placeholder fixture, build-time like the rest of
          Home; #90 (launch blocker) swaps this to the runtime `getReviews()`.
          NB for #90: the swap must ALSO set this route's render strategy (e.g.
          `export const revalidate`) — under pure SSG, getReviews() resolves
          empty at build (API_BASE is runtime-only) and the section would
          silently vanish from the baked HTML. */}
      <Reviews summary={getReviewsMock()} />
      <ClosingCTA />
    </>
  );
}
