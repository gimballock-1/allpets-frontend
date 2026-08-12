import { cn } from "@/lib/cn";

/**
 * Loading skeletons (8.13, P2) — placeholders for the App Router `loading.tsx`
 * boundaries, sized to the REAL components they stand in for (ServiceCard,
 * PersonCard, SectionHeading) so the content swap causes no layout jump (the
 * CLS lever 12.8 leans on, req §8.3). All decorative: each loading boundary
 * carries one sr-only `role="status"` announcement; the blocks are aria-hidden.
 * The pulse respects `prefers-reduced-motion` (req §8.1).
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("bg-panel motion-reduce:animate-none animate-pulse rounded-md", className)}
    />
  );
}

/** Body-copy stand-in: `lines` bars, the last one short (ragged paragraph edge). */
export function TextSkeleton({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div aria-hidden className={cn("flex flex-col gap-3", className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={cn("h-4", i === lines - 1 ? "w-2/3" : "w-full")} />
      ))}
    </div>
  );
}

/** SectionHeading (h1 page-header variant) stand-in: eyebrow, title, subtitle. */
export function PageHeadingSkeleton({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("flex flex-col gap-4", className)}>
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-11 w-full max-w-md" />
      <div className="flex max-w-2xl flex-col gap-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

/** ServiceCard stand-in: icon tile, name, blurb, "Learn more" bar (same padding). */
export function CardSkeleton() {
  return (
    <div
      aria-hidden
      className="rounded-card border-border bg-paper flex flex-col gap-3 border p-6 shadow-sm"
    >
      <Skeleton className="h-11 w-11" />
      <Skeleton className="h-6 w-3/4" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <Skeleton className="mt-1 h-5 w-28" />
    </div>
  );
}

/** PersonCard/TeamCard stand-in: circular photo, name, role (same padding). */
export function PersonCardSkeleton() {
  return (
    <div
      aria-hidden
      className="rounded-card border-border bg-paper flex flex-col items-center gap-3 border p-6 shadow-sm"
    >
      <Skeleton className="rounded-pill h-24 w-24" />
      <div className="flex flex-col items-center gap-2">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

/** The one announcement per loading boundary — screen readers hear "Loading". */
export function LoadingAnnouncement() {
  return (
    <p role="status" className="sr-only">
      Loading…
    </p>
  );
}
