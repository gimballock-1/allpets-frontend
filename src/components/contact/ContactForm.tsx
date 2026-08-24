"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { Button, PhoneLink } from "@/components/ui";
import {
  CONTACT_FIELDS,
  CONTACT_LIMITS,
  contactFieldErrors,
  type ContactField,
  type ContactFieldErrors,
} from "@/lib/contact";
import { cn } from "@/lib/cn";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "success" }
  | { kind: "error"; message: string };

const EMPTY_VALUES = { name: "", email: "", message: "", website: "" };

// border-input-border, not the decorative border-border: inputs sit on the
// same bg-paper as the Card around them, so the stroke is the only cue of the
// field's extent and must clear 3:1 in every theme (12.10/F2, WCAG 1.4.11).
const inputClass = (invalid: boolean) =>
  cn(
    "border-input-border bg-paper text-ink text-body placeholder:text-ink-subtle w-full rounded-md border px-4 py-2.5",
    invalid && "border-danger",
  );

/**
 * General-inquiry contact form (8.10, req §4.6) — the page's one client island.
 * Validates with the SAME shared schema the `/api/contact` route enforces
 * (src/lib/contact.ts), shows inline errors (`aria-describedby`, input
 * preserved), and submits same-origin — the browser never calls the Spring
 * host. Includes the 14.3 honeypot field; enforcement is server-side.
 * NOT for booking — that's Cal.com (Epic 9); the page links `/book` beside it.
 */
export function ContactForm({
  phone,
  phoneE164,
  className,
}: {
  phone: string;
  phoneE164: string;
  className?: string;
}) {
  const id = useId();
  const [values, setValues] = useState(EMPTY_VALUES);
  const [errors, setErrors] = useState<ContactFieldErrors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  function setField(field: keyof typeof EMPTY_VALUES, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
    // Correcting a flagged field clears its error immediately (inline UX);
    // it re-validates on blur / submit.
    if (field !== "website" && errors[field]) {
      setErrors((e) => ({ ...e, [field]: undefined }));
    }
  }

  function validateField(field: ContactField) {
    const fieldErrs = contactFieldErrors(values);
    setErrors((e) => ({ ...e, [field]: fieldErrs?.[field] }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fieldErrs = contactFieldErrors(values);
    if (fieldErrs) {
      setErrors(fieldErrs);
      const first = CONTACT_FIELDS.find((f) => fieldErrs[f]);
      if (first) document.getElementById(`${id}-${first}`)?.focus();
      return;
    }

    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      if (res.ok) {
        // TODO(9.7): fire `contact-submitted` via the shared track() helper here
        // (success only, no PII in the event) once 9.7 lands.
        setValues(EMPTY_VALUES);
        setErrors({});
        setStatus({ kind: "success" });
      } else if (res.status === 429) {
        // Spring's per-IP rate limit (14.2), passed through by the proxy.
        setStatus({
          kind: "error",
          message: "Too many attempts — please try again in a few minutes",
        });
      } else {
        setStatus({
          kind: "error",
          message: "Something went wrong sending your message — please try again in a moment",
        });
      }
    } catch {
      setStatus({
        kind: "error",
        message: "We couldn’t reach the server — please check your connection and try again",
      });
    }
  }

  const field = (
    name: ContactField,
    label: string,
    input: (props: {
      id: string;
      "aria-invalid": true | undefined;
      "aria-describedby": string | undefined;
    }) => React.ReactNode,
  ) => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={`${id}-${name}`} className="text-small text-ink font-semibold">
        {label}
      </label>
      {input({
        id: `${id}-${name}`,
        "aria-invalid": errors[name] ? true : undefined,
        "aria-describedby": errors[name] ? `${id}-${name}-error` : undefined,
      })}
      {/* Always-mounted polite region per field (the success region below
          uses the same pattern): AT reliably announce CHANGES to an existing
          live region, not regions inserted already populated. The error text
          lands here the moment focus LEAVES the field (blur validation), when
          the field's aria-describedby is no longer being read (12.10/F5,
          WCAG 3.3.1). sr-only while empty — position:absolute, so it adds no
          flex-gap ghost row. The submit path is unchanged: focus still moves
          to the first invalid field, which announces its description on
          arrival. */}
      <p
        id={`${id}-${name}-error`}
        role="status"
        className={errors[name] ? "text-small text-danger" : "sr-only"}
      >
        {errors[name] ?? ""}
      </p>
    </div>
  );

  return (
    <form onSubmit={onSubmit} noValidate className={cn("flex flex-col gap-5", className)}>
      {/* Every visible field is `required`; say so up front instead of letting
          a sighted user discover it from the first blur error (12.10/F4,
          WCAG 3.3.2). One line beats per-field asterisks when ALL fields are
          required. */}
      <p className="text-small text-ink-subtle">All fields are required.</p>

      {field("name", "Name", (a11y) => (
        <input
          {...a11y}
          name="name"
          type="text"
          autoComplete="name"
          required
          maxLength={CONTACT_LIMITS.name}
          value={values.name}
          onChange={(e) => setField("name", e.target.value)}
          onBlur={() => validateField("name")}
          className={inputClass(Boolean(errors.name))}
        />
      ))}

      {field("email", "Email", (a11y) => (
        <input
          {...a11y}
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={CONTACT_LIMITS.email}
          value={values.email}
          onChange={(e) => setField("email", e.target.value)}
          onBlur={() => validateField("email")}
          className={inputClass(Boolean(errors.email))}
        />
      ))}

      {field("message", "How can we help?", (a11y) => (
        <textarea
          {...a11y}
          name="message"
          rows={6}
          required
          maxLength={CONTACT_LIMITS.message}
          value={values.message}
          onChange={(e) => setField("message", e.target.value)}
          onBlur={() => validateField("message")}
          className={inputClass(Boolean(errors.message))}
        />
      ))}

      {/* Honeypot (14.3): parked OFF-SCREEN rather than display:none — some
          bots skip display:none fields, while an off-screen one still looks
          fillable to them yet stays invisible to sighted users. aria-hidden +
          tabIndex −1 keep it out of the AT/keyboard flow and autoComplete off
          keeps browsers from autofilling it for real users; bots that fill it
          are silently dropped server-side (fake success — see /api/contact). */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor={`${id}-website`}>Website</label>
        <input
          id={`${id}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          maxLength={CONTACT_LIMITS.website}
          value={values.website}
          onChange={(e) => setField("website", e.target.value)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <Button type="submit" disabled={status.kind === "sending"}>
          {status.kind === "sending" ? "Sending…" : "Send message"}
        </Button>
        {/* Privacy link at the point of submission (req §4.6/§8.4). */}
        <p className="text-small text-ink-subtle">
          By sending, you agree to our{" "}
          <Link href="/privacy" className="hover:text-ink underline underline-offset-2">
            Privacy Policy
          </Link>
          .
        </p>
      </div>

      {/* Always-mounted live region so the success confirmation is announced. */}
      <p
        role="status"
        aria-live="polite"
        className={
          status.kind === "success"
            ? "border-brand bg-panel text-ink text-body rounded-md border-l-4 p-4"
            : "sr-only"
        }
      >
        {status.kind === "success"
          ? "Thanks — your message is on its way. We’ll be in touch soon."
          : ""}
      </p>

      {status.kind === "error" ? (
        <p role="alert" className="border-danger text-body text-ink rounded-md border-l-4 p-4">
          {status.message}, or call us at{" "}
          <PhoneLink
            phone={phone}
            phoneE164={phoneE164}
            className="text-brand-strong font-semibold"
          />
          .
        </p>
      ) : null}
    </form>
  );
}
