import { NextResponse } from "next/server";
import { apiBase } from "@/env.server";
import { ContactFormSchema } from "@/lib/contact";

/**
 * Same-origin contact proxy (8.10, Frontend LLD §4.2) — the browser POSTs here;
 * this handler re-validates with the shared schema and forwards server→server
 * to the Spring `POST /contact` (20.3). The API origin never reaches the
 * client, and every response body is a fixed shape — no backend detail leaks.
 *
 * Anti-spam seams: the filled-honeypot drop (14.3) runs HERE, before any
 * backend hop, and Spring re-checks the same `website` field on what IS
 * forwarded (belt-and-braces — field name is the cross-repo contract);
 * per-IP rate limiting lives on the Spring side (14.2 — keyed off the
 * X-Forwarded-For passed below, surfaced to the browser as the 429 relay).
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

  // Honeypot tripped (14.3): the field is off-screen + aria-hidden +
  // autofill-proof, so a value here is a bot, not a person. Checked on the RAW
  // body BEFORE validation, and ANY explicitly-present value other than the
  // empty string trips it — non-strings (`true`, `1`, `{}`…) included — so a
  // filled-honeypot payload can never elicit a 400 (e.g. via an oversized
  // `website` or a bad email): any answer other than the EXACT success
  // shape/status a real submission gets would teach spammers which field is
  // the trap. Dropped without a backend hop. Count-only log line on purpose:
  // no payload, no IP, nothing that reveals the trap or leaks PII to anyone
  // tailing pod logs.
  if (
    typeof payload === "object" &&
    payload !== null &&
    "website" in payload &&
    (payload as { website: unknown }).website !== ""
  ) {
    console.warn("contact: honeypot drop");
    return NextResponse.json({ status: "received" }, { status: 202 });
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
