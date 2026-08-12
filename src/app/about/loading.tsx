import { Container } from "@/components/ui";
import {
  LoadingAnnouncement,
  PageHeadingSkeleton,
  PersonCardSkeleton,
  TextSkeleton,
} from "@/components/skeletons";

/** About loading state (8.13) — mirrors the 8.9 story article + team grid. */
export default function Loading() {
  return (
    <Container className="py-16" aria-busy="true">
      <LoadingAnnouncement />
      <PageHeadingSkeleton />
      <TextSkeleton lines={8} className="mt-10 max-w-3xl" />
      <div aria-hidden className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <PersonCardSkeleton key={i} />
        ))}
      </div>
    </Container>
  );
}
