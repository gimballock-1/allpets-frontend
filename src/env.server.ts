import "server-only";
import { requiredUrl } from "@/lib/env-validators";

/**
 * Server-only environment config (7.9). The `server-only` import makes importing
 * this module from a Client Component a BUILD error — a hard guard, not just a
 * runtime check.
 *
 * `API_BASE` is plain runtime env (changeable WITHOUT a rebuild). The browser only
 * ever calls same-origin `/api/*` routes; the proxy handlers (Epic 8/10) fetch this
 * Spring host server-side. Read lazily so a server module that doesn't need it
 * isn't gated on it being set.
 */
export function apiBase(): string {
  return requiredUrl("API_BASE", process.env.API_BASE);
}
