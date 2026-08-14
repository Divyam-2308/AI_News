import type { Metadata } from "next";

import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "AI News — Daily AI Digest",
  description:
    "A curated AI daily digest — top stories, funding, and research highlights in your inbox every morning.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}