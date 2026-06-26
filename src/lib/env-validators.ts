// Pure env validators (client- and server-safe). Shared by src/env.ts (public)
// and src/env.server.ts (server-only) so neither couples to the other.

export function requiredEnv(name: string, value: string | undefined): string {
  if (!value || value.trim() === "") {
    throw new Error(
      `Missing required env var: ${name}. Copy .env.example → .env.local (dev) or set the repo variable / build-arg (CI).`,
    );
  }
  return value;
}

/** Require a valid http(s) URL (so a malformed value fails at boot, not later). */
export function requiredUrl(name: string, value: string | undefined): string {
  const v = requiredEnv(name, value);
  let url: URL;
  try {
    url = new URL(v);
  } catch {
    throw new Error(`Env var ${name} must be a valid URL (got "${v}").`);
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error(`Env var ${name} must be an http(s) URL (got "${v}").`);
  }
  return v;
}

/** Require a bare hostname (no protocol or path) — e.g. the Plausible domain. */
export function requiredHost(name: string, value: string | undefined): string {
  const v = requiredEnv(name, value);
  if (v.includes("://") || v.includes("/")) {
    throw new Error(`Env var ${name} must be a bare hostname without protocol or path (got "${v}").`);
  }
  return v;
}
