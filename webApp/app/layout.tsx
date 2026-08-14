import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "@/styles/globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ByteDaily — Get Latest AI News Daily On Your Email",
  description:
    "ByteDaily uses AI to discover, summarize, and curate the news that matters to you. Delivering a personalized briefing straight to your inbox.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="min-h-full flex flex-col font-sans antialiased selection:bg-neutral-800 selection:text-white">
        {children}
      </body>
    </html>
  );
}