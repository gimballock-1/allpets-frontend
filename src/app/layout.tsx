import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "All Pets Veterinary Hospital",
  description:
    "All Pets Veterinary Hospital — compassionate veterinary care in Norman, Oklahoma.",
};

// Fonts (Plus Jakarta Sans, Sniglet, Be Vietnam Pro) are wired in 7.4; Tailwind in 7.2.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
