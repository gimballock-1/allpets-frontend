import type { Metadata } from "next";
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
        <main id="main" className="flex-1 scroll-mt-20">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
