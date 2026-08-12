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

const inputClass = (invalid: boolean) =>
  cn(
    "border-border bg-paper text-ink text-body placeholder:text-ink-subtle w-full rounded-md border px-4 py-2.5",
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
        setStatus({
          kind: "error",
          message: "We’ve received a lot of messages just now — please wait a minute and try again",
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
      {errors[name] ? (
        <p id={`${id}-${name}-error`} className="text-small text-danger">
          {errors[name]}
        </p>
      ) : null}
    </div>
  );

  return (
    <form onSubmit={onSubmit} noValidate className={cn("flex flex-col gap-5", className)}>
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

      {/* Honeypot (14.3): hidden from humans (display:none + aria-hidden +
          tabIndex −1); bots that fill it are silently dropped server-side. */}
      <div className="hidden" aria-hidden="true">
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
