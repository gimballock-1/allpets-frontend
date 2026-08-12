import { Container } from "@/components/ui";
import {
  LoadingAnnouncement,
  PageHeadingSkeleton,
  Skeleton,
  TextSkeleton,
} from "@/components/skeletons";

/** Contact loading state (8.13) — mirrors the 8.10 details + form columns.
 *  The map block matches StaticMap's reserved heights (h-64/sm:h-72 → CLS). */
export default function Loading() {
  return (
    <Container className="py-16" aria-busy="true">
      <LoadingAnnouncement />
      <PageHeadingSkeleton />
      <div aria-hidden className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-6 w-32" />
            <TextSkeleton lines={3} className="max-w-sm" />
            <Skeleton className="rounded-card mt-2 h-64 w-full sm:h-72" />
          </div>
          <div className="flex flex-col gap-3">
            <Skeleton className="h-6 w-40" />
            <TextSkeleton lines={4} className="max-w-sm" />
          </div>
        </div>
        <div className="rounded-card border-border bg-paper flex flex-col gap-5 border p-8 shadow-sm">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-36 w-full" />
          <Skeleton className="rounded-pill h-12 w-40" />
        </div>
      </div>
    </Container>
  );
}
