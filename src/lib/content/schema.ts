/**
 * Content contract (8.1) — the single in-repo type/validation source for all
 * file-based marketing content (LLD §4.1). Replaces the former generated
 * `payload-types.ts`: there is no CMS, no content API, and no cross-repo type
 * dependency. Loaders (`./index.ts`) validate every record against these Zod
 * schemas at **build time**, so a malformed/missing field fails the build (CI),
 * never a runtime page crash. Pages consume the inferred types — never `any`.
 *
 * Authored schemas are `.strict()` so a typo'd optional frontmatter key (e.g.
 * `calcomUser:` for `calcomUsername:`) fails the build instead of silently
 * dropping the value (and the vet's booking deep-link).
 */
import { z } from "zod";

/** "08:00" / "18:30" 24h, or null = closed that day. */
const timeOfDay = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "must be 24h HH:MM")
  .nullable();

const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const WEEKDAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export const DayHoursSchema = z
  .object({
    day: z.enum(WEEKDAYS),
    open: timeOfDay, // null ⇒ closed
    close: timeOfDay,
  })
  .strict();

/** SEO frontmatter group, reused by services + pages (read by 12.1, never re-parsed). */
export const SeoSchema = z
  .object({
    metaTitle: z.string().min(1).optional(),
    metaDescription: z.string().min(1).optional(),
  })
  .strict()
  .optional();

// ── SiteSetting (content/site.ts) — clinic NAP, hours, socials, footer ────────
export const SiteSettingSchema = z
  .object({
    clinicName: z.string().min(1),
    legalName: z.string().min(1).optional(),
    tagline: z.string().min(1),
    /** Home hero copy (8.2). The hero image is a local public/ asset (static-imported
     *  for blur+dims); only its alt text is content-driven. */
    hero: z
      .object({
        headline: z.string().min(1),
        subcopy: z.string().min(1),
        imageAlt: z.string().min(1),
      })
      .strict(),
    /** Display form, e.g. "(405) 555-0123". */
    phone: z.string().min(1),
    /** Dialable E.164 for `tel:` links + schema.org, e.g. "+14055550123". */
    phoneE164: z
      .string()
      .regex(/^\+\d{7,15}$/, "must be E.164, e.g. +14055550123"),
    email: z.email(),
    address: z
      .object({
        street: z.string().min(1),
        city: z.string().min(1),
        state: z.string().min(1),
        zip: z.string().min(1),
        country: z.string().min(1).default("US"),
      })
      .strict(),
    /** Optional — feeds the static map + schema.org geo (12.4). */
    geo: z.object({ lat: z.number(), lng: z.number() }).strict().optional(),
    /** All 7 weekdays exactly, once each; the Contact page + schema.org format from this. */
    hours: z
      .array(DayHoursSchema)
      .length(7)
      .refine(
        (days) => new Set(days.map((d) => d.day)).size === 7,
        "hours must list all 7 distinct weekdays exactly once",
      ),
    emergency: z
      .object({
        /** After-hours / emergency referral copy (req §8.6; confirmed in 18.6). */
        text: z.string().min(1),
        referralPhone: z.string().optional(),
      })
      .strict(),
    socials: z
      .array(z.object({ platform: z.string().min(1), url: z.url() }).strict())
      .default([]),
    footerLinks: z
      .array(z.object({ label: z.string().min(1), href: z.string().min(1) }).strict())
      .default([]),
    /** Optional note shown near booking CTAs. */
    bookingNote: z.string().optional(),
  })
  .strict();

// ── Service (content/services/*.mdx frontmatter + MDX body) ──────────────────
export const ServiceFrontmatterSchema = z
  .object({
    title: z.string().min(1),
    slug: z.string().regex(KEBAB, "must be a kebab-case slug"),
    displayOrder: z.number().int(),
    shortDescription: z.string().min(1),
    /** IconBox key (7.6 primitive); not an SVG path. */
    icon: z.string().min(1),
    active: z.boolean().default(true),
    /** Bullet list rendered on the detail page (the Rev-2 gap this schema closes). */
    whatsIncluded: z.array(z.string().min(1)).default([]),
    typicalDurationMin: z.number().int().positive(),
    /** Local `public/` asset path, e.g. "/images/services/wellness.png" (7.13). */
    image: z.string().startsWith("/").optional(),
    seo: SeoSchema,
    // Cal.com pointers (HLD two-database boundary): the site deep-links into booking
    // but stores NO booking data. Used by the 9.3 vet picker / 6.16 link validation.
    calcomUsername: z.string().optional(),
    eventTypeSlug: z.string().optional(),
  })
  .strict();

// ── Team member / Vet (content/team/*.mdx frontmatter + MDX bio) ─────────────
export const TeamMemberFrontmatterSchema = z
  .object({
    name: z.string().min(1),
    slug: z.string().regex(KEBAB, "must be a kebab-case slug"),
    role: z.string().min(1),
    credentials: z.string().optional(),
    displayOrder: z.number().int(),
    /** Drives getVets() vs getTeamMembers(). */
    isVet: z.boolean().default(false),
    active: z.boolean().default(true),
    image: z.string().startsWith("/").optional(),
    /** Service slugs this vet performs — powers the 9.3 per-vet booking picker. */
    servicesPerformed: z.array(z.string()).default([]),
    /** This vet's Cal.com username (booking deep link). */
    calcomUsername: z.string().optional(),
  })
  .strict();

// ── Promotion (content/promotions.ts) — date-windowed, placement-scoped ──────
export const PROMO_PLACEMENTS = ["home", "services"] as const;
export const PromotionSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    body: z.string().min(1),
    placement: z.enum(PROMO_PLACEMENTS),
    active: z.boolean().default(true),
    /** ISO 8601 date/datetime; absent ⇒ unbounded on that side. */
    startsAt: z.iso.datetime({ offset: true }).optional(),
    endsAt: z.iso.datetime({ offset: true }).optional(),
    ctaLabel: z.string().optional(),
    ctaHref: z.string().optional(),
  })
  .strict();

// ── Page (content/pages/{about,privacy,terms}.mdx frontmatter + MDX body) ────
export const PageFrontmatterSchema = z
  .object({
    title: z.string().min(1),
    slug: z.string().regex(KEBAB, "must be a kebab-case slug"),
    seo: SeoSchema,
    /** ISO date — "last updated" line for legal pages (8.11). */
    updatedAt: z.string().optional(),
  })
  .strict();

// ── Reviews (runtime, consumed from Spring GET /reviews) ─────────────────────
export const ReviewSchema = z.object({
  author: z.string(),
  rating: z.number().min(0).max(5),
  text: z.string(),
  relativeTime: z.string().optional(),
  profilePhotoUrl: z.url().optional(),
});
export const ReviewsSummarySchema = z.object({
  /** Aggregate rating, or null when there are none / the cache is empty. */
  rating: z.number().min(0).max(5).nullable(),
  count: z.number().int().nonnegative(),
  reviews: z.array(ReviewSchema),
});

// ── Inferred types: the contract pages import ────────────────────────────────
export type DayHours = z.infer<typeof DayHoursSchema>;
export type SiteSetting = z.infer<typeof SiteSettingSchema>;
/** As authored (TS input, before defaults applied). */
export type SiteSettingInput = z.input<typeof SiteSettingSchema>;

export type ServiceFrontmatter = z.infer<typeof ServiceFrontmatterSchema>;
/** Resolved record returned by the loader: frontmatter + the raw MDX body. */
export type Service = ServiceFrontmatter & { body: string };

export type TeamMemberFrontmatter = z.infer<typeof TeamMemberFrontmatterSchema>;
export type TeamMember = TeamMemberFrontmatter & { body: string };

export type Promotion = z.infer<typeof PromotionSchema>;
export type PromotionInput = z.input<typeof PromotionSchema>;
export type PromotionPlacement = (typeof PROMO_PLACEMENTS)[number];

export type PageFrontmatter = z.infer<typeof PageFrontmatterSchema>;
export type Page = PageFrontmatter & { body: string };

export type Review = z.infer<typeof ReviewSchema>;
export type ReviewsSummary = z.infer<typeof ReviewsSummarySchema>;
