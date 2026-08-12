import { NextResponse } from "next/server";
import { apiBase } from "@/env.server";
import { ContactFormSchema } from "@/lib/contact";

/**
 * Same-origin contact proxy (8.10, Frontend LLD §4.2) — the browser POSTs here;
 * this handler re-validates with the shared schema and forwards server→server
 * to the Spring `POST /contact` (20.3). The API origin never reaches the
 * client, and every response body is a fixed shape — no backend detail leaks.
 *
 * Out of scope here (owned elsewhere): rate limiting + honeypot enforcement
 * live on the Spring side (14.2/14.3 — the honeypot field is forwarded as-is);
 * CSRF/Origin checks are 14.4's seam at this handler.
 */

/** Bound the proxy hop — a hung backend must fail the submit, not the request. */
const CONTACT_TIMEOUT_MS = 8_000;

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ status: "invalid" }, { status: 400 });
  }

  const parsed = ContactFormSchema.safeParse(payload);
  if (!parsed.success) {
    // The client validates first, so this only fires for non-form callers —
    // no per-field detail needed.
    return NextResponse.json({ status: "invalid" }, { status: 400 });
  }

  try {
    const res = await fetch(`${apiBase()}/contact`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        // Pass the real client through so Spring's per-IP rate limit (14.2) and
        // the stored anti-spam signals key on the visitor, not this proxy.
        // (Traefik appends its own hop; 14.2 owns the edge trust chain.)
        ...forwardedHeaders(request),
      },
      body: JSON.stringify(parsed.data),
      cache: "no-store",
      signal: AbortSignal.timeout(CONTACT_TIMEOUT_MS),
    });

    if (res.status === 429) {
      return NextResponse.json(
        { status: "rate_limited" },
        { status: 429, headers: { "retry-after": res.headers.get("retry-after") ?? "60" } },
      );
    }
    if (!res.ok) {
      return NextResponse.json({ status: "error" }, { status: 502 });
    }
    return NextResponse.json({ status: "received" }, { status: 202 });
  } catch {
    // Missing API_BASE, network failure, or timeout — same opaque failure.
    return NextResponse.json({ status: "error" }, { status: 502 });
  }
}

function forwardedHeaders(request: Request): Record<string, string> {
  const headers: Record<string, string> = {};
  const forwardedFor = request.headers.get("x-forwarded-for");
  const userAgent = request.headers.get("user-agent");
  if (forwardedFor) headers["x-forwarded-for"] = forwardedFor;
  if (userAgent) headers["user-agent"] = userAgent;
  return headers;
}
