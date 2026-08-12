import { Container } from "@/components/ui";
import {
  CardSkeleton,
  LoadingAnnouncement,
  PageHeadingSkeleton,
} from "@/components/skeletons";

/** Services index loading state (8.13) — mirrors the 8.7 heading + card grid. */
export default function Loading() {
  return (
    <Container className="py-16" aria-busy="true">
      <LoadingAnnouncement />
      <PageHeadingSkeleton />
      <div aria-hidden className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </Container>
  );
}
