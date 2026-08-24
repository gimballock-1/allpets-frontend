import { z } from "zod";

/**
 * Contact-form contract (8.10) — shared by the client form (inline validation)
 * and the `/api/contact` route handler (server validation), so both sides
 * enforce the SAME rules. Limits mirror the Spring `ContactRequest` bean
 * constraints (20.3) exactly: a payload this schema accepts is never 400'd
 * by the backend.
 */
export const CONTACT_LIMITS = {
  name: 200,
  email: 320,
  message: 5000,
  website: 200,
} as const;

export const ContactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Please enter your name.")
    .max(CONTACT_LIMITS.name, `Your name must be ${CONTACT_LIMITS.name} characters or fewer.`),
  email: z
    .string()
    .trim()
    .min(1, "Please enter your email address.")
    .max(CONTACT_LIMITS.email, `Your email must be ${CONTACT_LIMITS.email} characters or fewer.`)
    .pipe(z.email("Please enter a valid email address.")),
  message: z
    .string()
    .trim()
    .min(1, "Please tell us how we can help.")
    .max(
      CONTACT_LIMITS.message,
      `Your message must be ${CONTACT_LIMITS.message.toLocaleString("en-US")} characters or fewer.`,
    ),
  // Honeypot (14.3 field contract): humans never see it, so no user-facing rule —
  // the /api/contact proxy fake-succeeds filled submissions without forwarding,
  // and Spring re-checks the same field on what does arrive (belt-and-braces).
  // The cap matches the backend @Size so a bot can't use it for amplification.
  website: z.string().max(CONTACT_LIMITS.website).default(""),
});

export type ContactFormValues = z.infer<typeof ContactFormSchema>;

/** The visible, user-correctable fields (the honeypot never shows an error). */
export type ContactField = "name" | "email" | "message";
export const CONTACT_FIELDS: readonly ContactField[] = ["name", "email", "message"];

export type ContactFieldErrors = Partial<Record<ContactField, string>>;

/** First error message per visible field, or null when the values are valid. */
export function contactFieldErrors(values: unknown): ContactFieldErrors | null {
  const parsed = ContactFormSchema.safeParse(values);
  if (parsed.success) return null;
  const errors: ContactFieldErrors = {};
  for (const issue of parsed.error.issues) {
    const field = issue.path[0];
    if (
      (field === "name" || field === "email" || field === "message") &&
      errors[field] === undefined
    ) {
      errors[field] = issue.message;
    }
  }
  return errors;
}
