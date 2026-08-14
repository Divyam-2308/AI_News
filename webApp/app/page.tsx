"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import Nav from "@/components/nav";
import NewsletterForm from "@/components/form";

export default function Home() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Nav />

      <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 text-center">
        <div className="space-y-4">
          <span className="inline-flex items-center rounded-full border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            Free · Daily · Zero spam
          </span>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            AI News
          </h1>
          <p className="mx-auto max-w-md text-balance text-muted-foreground">
            The top AI stories, funding rounds, and research highlights —
            summarized and delivered to your inbox every morning.
          </p>
        </div>

        <Button size="lg" onClick={() => setOpen(true)}>
          Subscribe for free
        </Button>

        <NewsletterForm open={open} onOpenChange={setOpen} />
      </main>
    </>
  );
}