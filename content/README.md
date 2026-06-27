# `content/` — file-based marketing content (8.1)

All marketing content lives here as **typed TS modules** and **MDX files**, read at
**build time** and baked into the site image. There is **no CMS and no content API** —
to change content you **edit a file, commit, and the deploy pipeline publishes it**
(set-and-forget). A malformed file **fails the build** (caught in CI), never a live page.

The typed loaders in [`src/lib/content/`](../src/lib/content/index.ts) are the only way
pages read this — never `fs`/`import` content directly from a page.

## Layout

| Path | What | Loader |
|---|---|---|
| `site.ts` | Clinic name, phone, hours, address, socials, footer links | `getSite()` |
| `promotions.ts` | Date-windowed promo banners (`home` / `services`) | `getActivePromotions(placement)` |
| `services/*.mdx` | One service per file (frontmatter + long description) | `getServices()`, `getServiceBySlug(slug)` |
| `team/*.mdx` | One vet/team member per file (frontmatter + bio) | `getTeamMembers()`, `getVets()` |
| `pages/{about,privacy,terms}.mdx` | Long-form page bodies | `getPage(slug)` |

Reviews are **not** here — they're the one runtime read (`getReviews()`), fetched from
the Spring backend via the same-origin `/api/reviews` proxy.

## Authoring rules

- **Add a service / team member:** drop a new `.mdx` file in `services/` or `team/`. The
  filename is cosmetic; the `slug` in frontmatter is the URL. Slugs must be unique and
  kebab-case. Set `active: false` to hide without deleting; order with `displayOrder`.
- **Frontmatter is validated** against the Zod schemas in
  [`src/lib/content/schema.ts`](../src/lib/content/schema.ts) — that file is the source
  of truth for required/optional fields. A bad value stops the build with a pointed error.
- **Cal.com pointers** (`eventTypeSlug` on a service, `calcomUsername` on a vet) only
  *link into* booking — no booking data is stored here. Keep them in sync with the Cal.com
  event-type config (6.11).
- **Images** are local `public/` paths (e.g. `/images/services/wellness.png`), optional.
- **Times** in `site.ts` `hours` are 24h `HH:MM`; `null/null` means closed that day.

> Many values are currently **provisional placeholders** pending Epic 18 clinic
> confirmations (phone, hours, emergency referral, real team). Legal copy
> (privacy/terms) is authored in 17.9.
