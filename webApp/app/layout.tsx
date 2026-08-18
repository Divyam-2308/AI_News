import type { Metadata } from "next";
import { Questrial, Redacted_Script, Instrument_Sans, Inter } from "next/font/google";
import "@/styles/globals.css";

const questrial = Questrial({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-questrial",
  display: "swap",
});

const redactedScript = Redacted_Script({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-redacted",
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
  title: "AI-News — Get Latest AI News & Be Updated",
  description:
    "Register and get latest AI news, research breakthroughs, and daily digests delivered to your digital doorstep.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${questrial.variable} ${redactedScript.variable} ${instrumentSans.variable} ${inter.variable}`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col font-[family-name:var(--font-questrial)] antialiased selection:bg-neutral-800 selection:text-white bg-[#ffffff] text-[#000000]"
      >
        {children}
      </body>
    </html>
  );
}