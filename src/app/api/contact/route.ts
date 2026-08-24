import { isIP } from "node:net";
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
        // the stored anti-spam signals key on the visitor, not this proxy —
        // see forwardedHeaders() for why CF-Connecting-IP is the source.
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

/**
 * Headers that carry the real visitor through to Spring's per-IP rate limit
 * (14.2) and stored anti-spam signals (backend #123).
 *
 * Why CF-Connecting-IP, not the incoming X-Forwarded-For (verified LIVE):
 * k3s's klipper ServiceLB SNATs every external connection to the node's CNI
 * address (10.42.0.1) BEFORE it reaches Traefik, so the peer Traefik sees —
 * and therefore the X-Forwarded-For it writes — NEVER contains the visitor's
 * address. Forwarding that XFF handed Spring a fully-trusted hop chain whose
 * fallback keyed EVERY visitor into one shared bucket (empirically: 5×202
 * then 429 from one machine, and a different machine immediately 429'd).
 * The one value that survives to this handler with the real client IP is
 * Cloudflare's CF-Connecting-IP: the site is orange-cloud proxied so CF sets
 * it on every request, the SNAT rewrite is L3-only, and Traefik sanitizes
 * only the X-Forwarded-* family — this header passes through untouched.
 * Prefer it; fall back to the incoming XFF — valid only when a trusted edge
 * actually supplies a usable chain (even without the SNAT, Traefik rewrites
 * XFF to its socket peer, which would be the Cloudflare edge — so the
 * fallback is defense-in-depth, not a parallel source of truth); omit both
 * when neither exists (Spring then buckets by socket peer — its documented
 * fallback).
 *
 * Accepted residual (durable fix pending an operator decision): a caller that
 * bypasses Cloudflare (direct to the WAN IP) can spoof CF-Connecting-IP to
 * impersonate ARBITRARY buckets — exhaust a victim's bucket, or rotate values
 * to evade the limit — not merely pick its own. Still strictly better than
 * every real visitor sharing one bucket. The durable fix is origin trust:
 * only accept the header from Cloudflare's published ranges, or a Cloudflare
 * Transform-Rule shared secret, or a topology that preserves source IPs.
 */
function forwardedHeaders(request: Request): Record<string, string> {
  const headers: Record<string, string> = {};
  const clientIp =
    singleIpToken(request.headers.get("cf-connecting-ip")) ??
    request.headers.get("x-forwarded-for");
  const userAgent = request.headers.get("user-agent");
  if (clientIp) headers["x-forwarded-for"] = clientIp;
  if (userAgent) headers["user-agent"] = userAgent;
  return headers;
}

/** `value` iff it is ONE valid bare IP literal (v4 or v6), else null. */
function singleIpToken(value: string | null): string | null {
  if (!value) return null;
  // Cloudflare sets exactly ONE address, so a comma-joined chain, whitespace,
  // an `ip:port`, brackets, or a malformed literal is a forgery/misconfig —
  // reject it (falling back to XFF) rather than forward garbage as the value
  // Spring keys rate-limit buckets (and an inet-typed column) on. node:net's
  // isIP is a real parser — a hand-rolled shape regex passed junk like
  // `999.999.999.999` and `1::2::3` (Codex review of #106).
  const token = value.trim();
  return isIP(token) !== 0 ? token : null;
}
