import { Image, TeamCard } from "@/components/ui";
import type { TeamMember } from "@/lib/content";

/** Initials for the no-photo fallback (drops a "Dr." honorific). */
function initials(name: string): string {
  return name
    .replace(/^(dr\.?|mr\.?|mrs\.?|ms\.?)\s+/i, "")
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export type PersonCardProps = {
  member: TeamMember;
  headingLevel?: "h2" | "h3" | "h4";
};

/**
 * Content-aware person card (8.4 ↔ 8.9) — the single source of team-card markup.
 * Maps a `TeamMember`/`Vet` (8.1 loader) onto the presentational `ui/TeamCard`.
 * Renders the photo when present (a positioned wrapper so `fill` reserves space),
 * else a branded initials avatar so a missing image never leaves an empty circle.
 */
export function PersonCard({ member, headingLevel }: PersonCardProps) {
  const media = member.image ? (
    <span className="relative block h-full w-full">
      <Image
        src={member.image}
        // Decorative: the name + role render as text right beside the photo, so an
        // alt would make a screen reader announce them twice.
        alt=""
        fill
        sizes="96px"
        className="object-cover"
      />
    </span>
  ) : (
    <span
      aria-hidden
      className="font-display text-h3 text-brand-strong flex h-full w-full items-center justify-center font-bold"
    >
      {initials(member.name)}
    </span>
  );

  return (
    <TeamCard
      media={media}
      name={member.name}
      role={member.role}
      headingLevel={headingLevel}
    />
  );
}
