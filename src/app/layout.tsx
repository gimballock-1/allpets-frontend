import type { Metadata, Viewport } from "next";
import "./globals.css";
import { fontVariables } from "./fonts";
import { ACTIVE_THEME } from "@/lib/theme";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "All Pets Veterinary Hospital",
  description:
    "All Pets Veterinary Hospital — compassionate veterinary care in Norman, Oklahoma.",
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
