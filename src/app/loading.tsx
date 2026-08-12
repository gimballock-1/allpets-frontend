import { Container } from "@/components/ui";
import {
  LoadingAnnouncement,
  PageHeadingSkeleton,
  TextSkeleton,
} from "@/components/skeletons";

/** Root loading boundary (8.13) — generic page shape for any route without its own. */
export default function Loading() {
  return (
    <Container className="py-16" aria-busy="true">
      <LoadingAnnouncement />
      <PageHeadingSkeleton />
      <TextSkeleton lines={6} className="mt-10 max-w-3xl" />
    </Container>
  );
}
