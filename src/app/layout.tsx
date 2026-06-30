import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/config";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
});

export const metadata: Metadata = {
  title: `${SITE.name} — AI Intelligence Hub`,
  description: SITE.tagline,
  keywords: [
    "AI",
    "artificial intelligence",
    "agentic AI",
    "RAG",
    "LLM",
    "machine learning",
    "AI-Pulse",
    "Quantura Technologies",
  ],
  openGraph: {
    title: SITE.name,
    description: SITE.tagline,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}