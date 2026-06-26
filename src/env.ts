/**
 * Typed, validated environment access (7.9). Fails fast with a clear message if a
 * required var is missing, so a misconfigured deploy fails loudly — not silently.
 * See `.env.example` for the full var list and the build-time vs runtime split.
 *
 *   • NEXT_PUBLIC_*  — inlined at BUILD time → changing one needs a REBUILD, not just
 *     a redeploy. Safe to read in client OR server code (`publicEnv`).
 *   • API_BASE       — SERVER-ONLY runtime env (changeable without a rebuild). Never
 *     sent to the browser; read it via `apiBase()` in server code only.
 *
 * No secrets live here — all three origins are public.
 */

function required(name: string, value: string | undefined): string {
  if (!value || value.trim() === "") {
    throw new Error(
      `Missing required env var: ${name}. Copy .env.example → .env.local (dev) or set the repo variable / build-arg (CI).`,
    );
  }
  return value;
}

/**
 * Public config (NEXT_PUBLIC_*). Validated once at module load. These values are
 * build-time-inlined, so this object only sees the values present at build.
 */
export const publicEnv = {
  /** Cal.com embed origin (Epic 6/9). */
  calcomUrl: required("NEXT_PUBLIC_CALCOM_URL", process.env.NEXT_PUBLIC_CALCOM_URL),
  /** Plausible site domain (Epic 11). */
  plausibleDomain: required("NEXT_PUBLIC_PLAUSIBLE_DOMAIN", process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN),
  /** Plausible analytics script URL (Epic 11). */
  plausibleScriptUrl: required("NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL", process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL),
} as const;

/**
 * Spring backend base — SERVER-ONLY. The browser only ever calls same-origin
 * `/api/*` routes; the proxy handlers (Epic 8/10) fetch this host server-side.
 * Read lazily so importing this module from a Client Component (for `publicEnv`)
 * never requires `API_BASE`. Throws if called in the browser.
 */
export function apiBase(): string {
  if (typeof window !== "undefined") {
    throw new Error("apiBase() is server-only — do not call it from a Client Component.");
  }
  return required("API_BASE", process.env.API_BASE);
}
