import type { Metadata } from "next";
import { LegalPage, legalMetadata } from "@/components/legal/LegalPage";

/** Terms of Service "/terms" (8.11) — statically generated from content/pages/terms.mdx. */
export function generateMetadata(): Metadata {
  return legalMetadata("terms");
}

export default function TermsPage() {
  return <LegalPage slug="terms" />;
}
