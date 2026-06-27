/**
 * Public environment config (7.9) — `NEXT_PUBLIC_*` vars, **inlined at BUILD time**
 * (changing one needs a REBUILD, not just a redeploy). Safe to import in client OR
 * server code. Validated once at module load (fail fast). See `.env.example`.
 *
 * Server-only config (the Spring `API_BASE`) lives in `src/env.server.ts`.
 * No secrets — all origins are public.
 */
import { requiredHost, requiredUrl } from "@/lib/env-validators";

export const publicEnv = {
  /** Cal.com embed origin (Epic 6/9). */
  calcomUrl: requiredUrl("NEXT_PUBLIC_CALCOM_URL", process.env.NEXT_PUBLIC_CALCOM_URL),
  /** Plausible site domain — bare hostname (Epic 11). */
  plausibleDomain: requiredHost("NEXT_PUBLIC_PLAUSIBLE_DOMAIN", process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN),
  /** Plausible analytics script URL (Epic 11). */
  plausibleScriptUrl: requiredUrl(
    "NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL",
    process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL,
  ),
} as const;
