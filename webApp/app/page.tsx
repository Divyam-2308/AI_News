"use client";

import { useState } from "react";
import Link from "next/link";
import Nav from "@/components/nav";
import NewsletterForm from "@/components/form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    title: "Daily Briefing",
    description:
      "A hand-curated digest of the day's most important AI stories, delivered every morning before you start.",
  },
  {
    title: "Zero-LLM Summaries",
    description:
      "Clean, human-readable summaries. No AI-generated filler — just the signal, not the noise.",
  },
  {
    title: "Trusted Sources",
    description:
      "Aggregated from leading publications so you never miss the breakthroughs that matter.",
  },
];

const sources = [
  "Google News",
  "Hacker News",
  "The Verge",
  "TechCrunch",
  "MIT Tech Review",
  "VentureBeat",
  "IEEE Spectrum",
  "InfoQ",
  "Towards Data Science",
  "AI News",
];

export default function Home() {
  const [openSubscribe, setOpenSubscribe] = useState(false);

  return (
    <div className="relative min-h-screen flex flex-col bg-background text-foreground">
      {/* Header Navigation */}
      <Nav onOpenSubscribe={() => setOpenSubscribe(true)} />

      {/* Hero & Main Content */}
      <main className="flex-1">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 pt-24 pb-16 text-center md:pt-32">
          <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
            AI News, Daily
          </span>

          <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl">
            Get latest AI news, daily, on your e-mail
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-muted-foreground text-pretty">
            ByteDaily uses AI to discover, summarize, and curate the news that
            matters to you — a personalized briefing delivered straight to your
            inbox.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
            <Button
              onClick={() => setOpenSubscribe(true)}
              size="lg"
              className="h-11 rounded-full px-8 text-sm"
            >
              Subscribe for free
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-11 rounded-full px-8 text-sm"
            >
              <Link href="/blogs">Read the news</Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <section className="mx-auto w-full max-w-6xl px-6 pb-20">
          <div className="grid gap-5 md:grid-cols-3">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="rounded-2xl py-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5"
              >
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="mt-2 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* News Sources */}
        <section className="mx-auto w-full max-w-6xl px-6 pb-24">
          <div className="rounded-2xl border bg-muted/30 px-8 py-12 text-center">
            <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Sourced from
            </h2>
            <div className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-x-8 gap-y-4">
              {sources.map((source) => (
                <span
                  key={source}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {source}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto w-full max-w-6xl px-6 pb-20">
          <div className="flex flex-col items-center gap-6 rounded-3xl bg-foreground px-8 py-16 text-center text-background md:flex-row md:justify-between md:text-left">
            <div className="max-w-lg">
              <h2 className="text-3xl font-semibold tracking-tight text-balance">
                Start your daily briefing today
              </h2>
              <p className="mt-3 text-muted-foreground dark:text-muted-foreground">
                Join thousands of readers staying ahead of the curve — one email
                at a time.
              </p>
            </div>
            <Button
              onClick={() => setOpenSubscribe(true)}
              size="lg"
              className="h-11 shrink-0 rounded-full bg-background px-8 text-foreground hover:bg-background/90"
            >
              Subscribe Now
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mx-auto w-full max-w-6xl border-t px-6 py-8">
        <p className="text-center text-xs text-muted-foreground">
          &copy; 2026 ByteDaily AI. All rights reserved.
        </p>
      </footer>

      {/* Subscription Dialog Modal */}
      <NewsletterForm open={openSubscribe} onOpenChange={setOpenSubscribe} />
    </div>
  );
}