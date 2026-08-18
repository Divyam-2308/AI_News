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
      <header className="w-full py-8 px-6 md:px-12 lg:px-16 max-w-[1553px] mx-auto flex items-center justify-between z-20 relative">
        {/* Left Links */}
        <div className="flex items-center gap-8 font-[family-name:var(--font-instrument)] text-[18px] text-[#000000] font-normal">
          <Link
            href="/#about"
            className="hover:opacity-75 transition-opacity"
          >
            About
          </Link>
          <Link
            href="/blogs"
            className="hover:opacity-75 transition-opacity"
          >
            News
          </Link>
        </div>

        {/* Center Logo */}
        <Link
          href="/"
          className="font-[family-name:var(--font-kalnia)] text-[25px] md:text-[28px] font-semibold text-[#000000] tracking-normal hover:opacity-90 transition-opacity"
        >
          ByteDaily
        </Link>

        {/* Right CTA Button */}
        <div>
          <button
            onClick={handleSubscribe}
            className="bg-[#342d38] hover:bg-[#251f28] text-[#f4fff3] font-[family-name:var(--font-instrument)] text-[18px] font-medium w-[128px] h-[45px] rounded-[9px] flex items-center justify-center transition-all shadow-sm hover:shadow active:scale-95"
          >
            Subscribe
          </button>
        </div>
      </header>

      <NewsletterForm open={internalOpen} onOpenChange={setInternalOpen} />
    </>
  );
}