import type { Metadata } from "next";
import { Kaisei_Decol, Kalnia, Instrument_Sans, Inter } from "next/font/google";
import "@/styles/globals.css";

const kaiseiDecol = Kaisei_Decol({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-kaisei",
  display: "swap",
});

const kalnia = Kalnia({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-kalnia",
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-instrument",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ByteDaily — Get Latest AI News, Daily, On your E-mail",
  description:
    "ByteDaily uses AI to discover, summarize, and curate the news that matters to you. Delivering a personalized briefing straight to your inbox.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${kaiseiDecol.variable} ${kalnia.variable} ${instrumentSans.variable} ${inter.variable}`}
    >
      <body className="min-h-full flex flex-col font-sans antialiased selection:bg-foreground selection:text-background bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}