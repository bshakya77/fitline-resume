import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Figtree, Outfit } from "next/font/google";
import "./globals.css";

const sans = Figtree({
  subsets: ["latin"],
  variable: "--font-fit-sans",
  display: "swap",
});

const display = Outfit({
  subsets: ["latin"],
  variable: "--font-fit-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fitline",
  description: "Score a resume against a job posting.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
