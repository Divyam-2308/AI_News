"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import NewsletterForm from "@/components/form";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isBlogs = pathname.startsWith("/blogs");

  const linkClass = (active: boolean) =>
    active
      ? "text-foreground font-medium"
      : "text-muted-foreground hover:text-foreground transition-colors";

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
        <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="text-lg font-bold tracking-tight">
            AI News
          </Link>

          <div className="flex items-center gap-6">
            <Link href="/" className={linkClass(isHome)}>
              Home
            </Link>
            <Link href="/blogs" className={linkClass(isBlogs)}>
              Blogs
            </Link>
            <Button size="sm" onClick={() => setOpen(true)}>
              Subscribe
            </Button>
          </div>
        </nav>
      </header>

      <NewsletterForm open={open} onOpenChange={setOpen} />
    </>
  );
}