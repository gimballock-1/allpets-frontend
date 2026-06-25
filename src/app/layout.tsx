import type { Metadata } from "next";
import "./globals.css";
import { fontVariables } from "./fonts";
import { ACTIVE_THEME } from "@/lib/theme";

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
  // `fontVariables` declares --font-jakarta/-sniglet/-bevietnam on the root so the
  // design tokens can reference them; `data-theme` selects the active palette
  // (single source of truth → src/lib/theme.ts). Server-rendered, so no theme flash.
  return (
    <html lang="en" data-theme={ACTIVE_THEME} className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
