import { Hero } from "@/components/home/Hero";
import { ServicesGrid } from "@/components/home/ServicesGrid";
import { TeamTeaser } from "@/components/home/TeamTeaser";
import { ClosingCTA } from "@/components/home/ClosingCTA";

/**
 * Home "/" (Epic 8) — a Server Component composing the file-based, build-time
 * sections (8.2–8.6). Each section reads the 8.1 content getters and is
 * statically generated. The Google-reviews section (8.5) slots in between the team
 * teaser and the closing CTA once Epic 10 lands. Page metadata is 12.1.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <ServicesGrid />
      <TeamTeaser />
      {/* 8.5 Home reviews section lands here (runtime getReviews, needs Epic 10). */}
      <ClosingCTA />
    </>
  );
}
