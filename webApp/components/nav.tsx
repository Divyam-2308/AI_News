"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import NewsletterForm from "@/components/form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavProps {
  onOpenSubscribe?: () => void;
}

export default function Nav({ onOpenSubscribe }: NavProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isNews = pathname.startsWith("/blogs");

  const handleSubscribe = () => {
    if (onOpenSubscribe) {
      onOpenSubscribe();
    } else {
      setInternalOpen(true);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6 md:px-10">
          {/* Left Links */}
          <nav className="flex items-center gap-7 text-sm font-medium text-muted-foreground">
            <Link
              href="/"
              className={cn(
                "relative transition-colors hover:text-foreground",
                isHome
                  ? "text-foreground after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-foreground"
                  : "text-muted-foreground",
              )}
            >
              Home
            </Link>
            <Link
              href="/blogs"
              className={cn(
                "relative transition-colors hover:text-foreground",
                isNews
                  ? "text-foreground after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-foreground"
                  : "text-muted-foreground",
              )}
            >
              News
            </Link>
          </nav>

          {/* Center Logo */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 text-lg font-semibold tracking-tight transition-opacity hover:opacity-70"
          >
            ByteDaily
          </Link>

          {/* Right CTA Button */}
          <Button onClick={handleSubscribe} size="sm" className="px-4">
            Subscribe
          </Button>
        </div>
      </header>

      <NewsletterForm open={internalOpen} onOpenChange={setInternalOpen} />
    </>
  );
}