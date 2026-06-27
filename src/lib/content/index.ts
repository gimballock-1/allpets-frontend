/**
 * File-based content loader (8.1) — the one typed, build-time data layer every
 * Epic-8 page imports instead of scattering ad-hoc file reads (LLD §4.1).
 *
 * BUILD-TIME ONLY. These getters read `content/` from disk with `fs` and resolve
 * during `next build` (pure SSG, LLD §3.5) — the results are baked into static
 * HTML, so `content/` is NOT shipped in the standalone runtime image and these
 * must never run on a request path. `server-only` blocks client-component import;
 * the SSG contract keeps them off the runtime path. There is NO network call, NO
 * credential, and NO content-API URL here — content is compiled into the site.
 *
 * Validation is fail-fast: a malformed/missing field throws, failing the build in
 * CI rather than crashing a page at runtime. Getters return the real inferred
 * types from `./schema`, never `any`.
 *
 * The one runtime read — `getReviews()` — lives in `./reviews` (network, fetched
 * through the same-origin `/api/reviews` proxy), re-exported here for one import.
 */
import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

import { site as siteData } from "@content/site";
import { promotions as promotionData } from "@content/promotions";
import {
  PageFrontmatterSchema,
  PromotionSchema,
  ServiceFrontmatterSchema,
  SiteSettingSchema,
  TeamMemberFrontmatterSchema,
  type Page,
  type Promotion,
  type PromotionPlacement,
  type Service,
  type SiteSetting,
  type TeamMember,
} from "./schema";

export type {
  DayHours,
  Page,
  Promotion,
  PromotionPlacement,
  Review,
  ReviewsSummary,
  Service,
  SiteSetting,
  TeamMember,
} from "./schema";
export { getReviews } from "./reviews";

const CONTENT_DIR = path.join(process.cwd(), "content");

/** Validate `data` or throw a build-stopping error that names the source. */
function parseOrThrow<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown,
  source: string,
): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const detail = result.error.issues
      .map((i) => `  • ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid content in ${source}:\n${detail}`);
  }
  return result.data;
}

/** Read every `*.mdx` in `content/<subdir>`, returning frontmatter + raw MDX body. */
function readMdxCollection<T extends z.ZodTypeAny>(
  subdir: string,
  schema: T,
): Array<z.infer<T> & { body: string }> {
  const dir = path.join(CONTENT_DIR, subdir);
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"));
  return files.map((file) => {
    const raw = fs.readFileSync(path.join(dir, file), "utf8");
    const { data, content } = matter(raw);
    const frontmatter = parseOrThrow(schema, data, `content/${subdir}/${file}`);
    // Object.assign (not spread) — TS can't spread a generic `z.infer<T>`.
    return Object.assign({}, frontmatter, { body: content.trim() }) as z.infer<
      T
    > & { body: string };
  });
}

/** Stable order: displayOrder asc, then a string key for deterministic ties. */
function byDisplayOrder<T extends { displayOrder: number }>(
  tiebreak: (item: T) => string,
) {
  return (a: T, b: T) =>
    a.displayOrder - b.displayOrder || tiebreak(a).localeCompare(tiebreak(b));
}

/** Throw if two records share a slug (a silent content-authoring footgun). */
function assertUniqueSlugs(items: Array<{ slug: string }>, source: string) {
  const seen = new Set<string>();
  for (const { slug } of items) {
    if (seen.has(slug)) throw new Error(`Duplicate slug "${slug}" in ${source}`);
    seen.add(slug);
  }
}

// ── SiteSetting ──────────────────────────────────────────────────────────────
let siteCache: SiteSetting | undefined;
/** Clinic NAP, hours, socials, footer links (content/site.ts). */
export function getSite(): SiteSetting {
  siteCache ??= parseOrThrow(SiteSettingSchema, siteData, "content/site.ts");
  return siteCache;
}

// ── Services ─────────────────────────────────────────────────────────────────
/** Active services, sorted by displayOrder (content/services/*.mdx). */
export function getServices(): Service[] {
  const all = readMdxCollection("services", ServiceFrontmatterSchema);
  assertUniqueSlugs(all, "content/services");
  return all
    .filter((s) => s.active)
    .sort(byDisplayOrder((s) => s.title)) as Service[];
}

/** One active service by slug, or null (caller → notFound() for 8.8). */
export function getServiceBySlug(slug: string): Service | null {
  return getServices().find((s) => s.slug === slug) ?? null;
}

// ── Team / Vets ──────────────────────────────────────────────────────────────
/** Active team members, sorted by displayOrder (content/team/*.mdx). */
export function getTeamMembers(): TeamMember[] {
  const all = readMdxCollection("team", TeamMemberFrontmatterSchema);
  assertUniqueSlugs(all, "content/team");
  return all
    .filter((m) => m.active)
    .sort(byDisplayOrder((m) => m.name)) as TeamMember[];
}

/** Active vets only (team members with `isVet: true`). */
export function getVets(): TeamMember[] {
  return getTeamMembers().filter((m) => m.isVet);
}

// ── Promotions ───────────────────────────────────────────────────────────────
/** Active, in-window promotions for a placement (content/promotions.ts). */
export function getActivePromotions(
  placement: PromotionPlacement,
  now: Date = new Date(),
): Promotion[] {
  const all = z
    .array(PromotionSchema)
    .parse(promotionData) satisfies Promotion[];
  const ts = now.getTime();
  return all.filter(
    (p) =>
      p.active &&
      p.placement === placement &&
      (!p.startsAt || Date.parse(p.startsAt) <= ts) &&
      (!p.endsAt || Date.parse(p.endsAt) >= ts),
  );
}

// ── Pages (about | privacy | terms) ──────────────────────────────────────────
/** One MDX page by slug (content/pages/<slug>.mdx), or null (caller → notFound). */
export function getPage(slug: string): Page | null {
  const file = path.join(CONTENT_DIR, "pages", `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  const frontmatter = parseOrThrow(
    PageFrontmatterSchema,
    data,
    `content/pages/${slug}.mdx`,
  );
  return { ...frontmatter, body: content.trim() };
}
