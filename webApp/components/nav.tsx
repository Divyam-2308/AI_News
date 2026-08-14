"use client";

import { useState } from "react";
import Link from "next/link";

import NewsletterForm from "@/components/form";

interface NavProps {
  onOpenSubscribe?: () => void;
}

export default function Nav({ onOpenSubscribe }: NavProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const handleSubscribe = () => {
    if (onOpenSubscribe) {
      onOpenSubscribe();
    } else {
      setInternalOpen(true);
    }
  };

  return (
    <>
      <header className="w-full py-8 px-8 md:px-16 lg:px-24 max-w-[1600px] mx-auto flex items-center justify-between z-20 relative">
        {/* Left Links */}
        <div className="flex items-center gap-8 text-base text-neutral-800 font-medium">
          <Link
            href="/#about"
            className="italic font-serif text-lg md:text-xl hover:opacity-75 transition-opacity"
          >
            About
          </Link>
          <Link
            href="/blogs"
            className="hover:opacity-75 transition-opacity md:text-lg"
          >
            News
          </Link>
        </div>

        {/* Center Logo */}
        <Link
          href="/"
          className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 hover:opacity-90 transition-opacity"
        >
          ByteDaily
        </Link>

        {/* Right CTA Button */}
        <div>
          <button
            onClick={handleSubscribe}
            className="bg-[#272e25] hover:bg-[#1a2019] text-white text-sm md:text-base font-semibold px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            Subscribe
          </button>
        </div>
      </header>

      <NewsletterForm open={internalOpen} onOpenChange={setInternalOpen} />
    </>
  );
}