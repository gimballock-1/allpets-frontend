import type { Metadata, Viewport } from "next";
import "./globals.css";
import { fontVariables } from "./fonts";
import { ACTIVE_THEME } from "@/lib/theme";
import { getSite } from "@/lib/content";
import { SITE_URL } from "@/lib/seo";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

// Clinic name/copy come from the 8.1 content layer — the ONE source the
// Footer/Contact/schema.org also read — never re-hardcoded here (12.1).
const site = getSite();

export const metadata: Metadata = {
  // metadataBase ⇒ relative canonical/og:url values resolve to the absolute
  // PRODUCTION origin (12.1) — required, or Next falls back to localhost.
  metadataBase: new URL(SITE_URL),
  // template ⇒ pages set just their own name ("Our Services") and the clinic
  // suffix is appended in ONE place — pageMetadata (12.1) must not re-suffix.
  title: {
    default: `${site.clinicName} — ${site.address.city}, ${site.address.state}`,
    template: `%s — ${site.clinicName}`,
  },
  description: site.hero.subcopy,
  // Site-wide OG/Twitter defaults. Public pages compose their full og block via
  // pageMetadata (openGraph merges shallowly); these cover everything else
  // (404 etc.). NO images here — the file-convention src/app/opengraph-image.tsx
  // (12.5) injects og:image/twitter:image at this segment, and pageMetadata
  // re-references the same route; a third listing would double-emit it.
  // Canonicals are strictly per-page (12.1) — a root default would leak "/"
  // onto routes that don't override it.
  openGraph: {
    type: "website",
    siteName: site.clinicName,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
};

// Mobile browser-chrome color = the 7.3 Fresh & Clean brand primary (7.12).
export const viewport: Viewport = {
  themeColor: "#2670BE",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // `fontVariables` declares the --font-* vars on the root; `data-theme` selects
  // the active palette (single source of truth → src/lib/theme.ts). Server-rendered.
  return (
    <html lang="en" data-theme={ACTIVE_THEME} className={fontVariables}>
      <body>
        <a
          href="#main"
          className="bg-brand text-on-brand sr-only z-50 rounded-md px-4 py-2 font-semibold focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <Header />
        {/* tabIndex=-1 so the skip link actually moves focus here (not just scrolls). */}
        <main id="main" tabIndex={-1} className="flex-1 scroll-mt-20 outline-none">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
