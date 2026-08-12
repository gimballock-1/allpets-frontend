import type { Metadata } from "next";
import { LegalPage, legalMetadata } from "@/components/legal/LegalPage";

/** Privacy Policy "/privacy" (8.11) — statically generated from content/pages/privacy.mdx. */
export function generateMetadata(): Metadata {
  return legalMetadata("privacy");
}

export default function PrivacyPage() {
  return <LegalPage slug="privacy" />;
}
