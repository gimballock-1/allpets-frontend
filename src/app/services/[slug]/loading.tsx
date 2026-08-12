import { Container } from "@/components/ui";
import {
  LoadingAnnouncement,
  PageHeadingSkeleton,
  Skeleton,
  TextSkeleton,
} from "@/components/skeletons";

/** Service detail loading state (8.13) — mirrors the 8.8 two-column layout. */
export default function Loading() {
  return (
    <Container className="py-16" aria-busy="true">
      <LoadingAnnouncement />
      <Skeleton className="h-5 w-24" />
      <PageHeadingSkeleton className="mt-6" />
      <div aria-hidden className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        <TextSkeleton lines={10} />
        <div className="rounded-card border-border bg-paper flex flex-col gap-4 border p-6 shadow-sm">
          <Skeleton className="h-6 w-40" />
          <TextSkeleton lines={4} />
          <Skeleton className="rounded-pill mt-2 h-12 w-full" />
        </div>
      </div>
    </Container>
  );
}
