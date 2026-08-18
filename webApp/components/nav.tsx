"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import RegisterModal from "@/components/register-modal";

interface NavProps {
  onOpenSubscribe?: () => void;
}

export default function Nav({ onOpenSubscribe }: NavProps) {
  const [internalModalOpen, setInternalModalOpen] = useState(false);
  const pathname = usePathname();

  const handleRegisterClick = () => {
    if (onOpenSubscribe) {
      onOpenSubscribe();
    } else {
      setInternalModalOpen(true);
    }
  };

  const isHome = pathname === "/";
  const isNews = pathname.startsWith("/blogs") || pathname.startsWith("/news");

  return (
    <>
      <header className="w-full mx-auto z-20 shrink-0">
        {/* Floating Dark Glass Navbar */}
        <div className="w-full h-[54px] sm:h-[62px] md:h-[68px] bg-[#000000]/20 backdrop-blur-xl border border-white/20 rounded-[50px] md:rounded-[60px] px-4 sm:px-8 md:px-10 flex items-center justify-between shadow-xl">
          {/* Brand Logo with Script Underline */}
          <Link
            href="/"
            className="flex flex-col items-start group transition-transform duration-200 hover:scale-105"
          >
            <span className="font-[family-name:var(--font-questrial)] text-[20px] sm:text-[25px] md:text-[28px] font-normal text-white tracking-wide leading-none">
              AI-News
            </span>
            <span className="font-[family-name:var(--font-redacted)] text-[14px] md:text-[18px] text-white/70 -mt-1.5 leading-none select-none tracking-widest">
              ~~~~~~~
            </span>
          </Link>

          {/* Navigation Links & Action Button */}
          <div className="flex items-center gap-4 sm:gap-7 md:gap-9">
            <Link
              href="/"
              className={`font-[family-name:var(--font-questrial)] text-[15px] sm:text-[19px] md:text-[22px] text-white transition-all ${
                isHome
                  ? "underline underline-offset-8 decoration-2 decoration-white font-medium"
                  : "text-white/80 hover:text-white"
              }`}
            >
              Home
            </Link>
            <Link
              href="/blogs"
              className={`font-[family-name:var(--font-questrial)] text-[15px] sm:text-[19px] md:text-[22px] text-white transition-all ${
                isNews
                  ? "underline underline-offset-8 decoration-2 decoration-white font-medium"
                  : "text-white/80 hover:text-white"
              }`}
            >
              News
            </Link>

            {/* Register CTA Button */}
            <button
              type="button"
              onClick={handleRegisterClick}
              className="w-[100px] sm:w-[125px] md:w-[145px] h-[34px] sm:h-[38px] md:h-[44px] bg-[#ffffff] hover:bg-neutral-100 text-[#000000] font-[family-name:var(--font-questrial)] text-[15px] sm:text-[17px] md:text-[20px] font-normal rounded-[70px] md:rounded-[83px] flex items-center justify-center transition-all shadow-md hover:shadow-lg active:scale-95 ml-1"
            >
              Register
            </button>
          </div>
        </div>
      </header>

      <RegisterModal open={internalModalOpen} onOpenChange={setInternalModalOpen} />
    </>
  );
}