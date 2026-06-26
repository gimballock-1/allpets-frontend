import { NextResponse } from "next/server";

/**
 * Shallow frontend health check (7.11). "Healthy" means the Node server is
 * serving requests — it deliberately does NOT check the Spring backend or
 * Cal.com. A dependency blip must not flip this to non-200 and take the whole
 * site out of rotation; graceful degradation is the page's job (booking fallback
 * 9.5, reviews fallback 10.7). The Spring backend's Actuator health (20.1) is the
 * one that checks the DB.
 *
 * Consumed by the k8s readiness/liveness probes (7.8) and Uptime Kuma (2.8).
 * Unauthenticated, no PII (req §8.4).
 */
export const dynamic = "force-dynamic"; // never statically cached — probes need a live answer

export function GET() {
  return NextResponse.json(
    {
      status: "ok",
      // Injected via the 7.8 build args / container env; null in local dev.
      gitSha: process.env.GIT_SHA ?? null,
      buildTime: process.env.BUILD_TIME ?? null,
    },
    {
      status: 200,
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    },
  );
}
