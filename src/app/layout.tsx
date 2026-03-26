import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GolfGives — Play Golf. Change Lives.",
  description:
    "Subscribe, enter your Stableford scores, and automatically give to charity. Every round you play makes a difference.",
  keywords: ["golf", "charity", "stableford", "subscription", "donate"],
  openGraph: {
    title: "GolfGives — Play Golf. Change Lives.",
    description: "Every round you play makes a difference.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
