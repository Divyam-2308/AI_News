"use client";

import { useState } from "react";
import Image from "next/image";
import Nav from "@/components/nav";
import { ProceduralBG } from "@/components/procedural-bg";
import NewsletterForm from "@/components/form";

export default function Home() {
  const [openSubscribe, setOpenSubscribe] = useState(false);

  // All 11 News Sources from Figma MT-1 group
  const newsSources = [
    { name: "Google News", src: "/logos/google-news.png" },
    { name: "Hacker News", src: "/logos/hackernews.png" },
    { name: "The Verge", src: "/logos/the-verge.png" },
    { name: "Towards Data Science", src: "/logos/towards-data-science.png" },
    { name: "TechCrunch", src: "/logos/techcrunch.png" },
    { name: "Synced Review", src: "/logos/synced-review.png" },
    { name: "MIT Tech Review", src: "/logos/mit-technology-review.png" },
    { name: "InfoQ", src: "/logos/infoq.png" },
    { name: "IEEE Spectrum", src: "/logos/ieee-spectrum.png" },
    { name: "VentureBeat", src: "/logos/venturebeat.png" },
    { name: "AI News", src: "/logos/ai-news.png" },
  ];

  return (
    <div className="relative min-h-screen text-[#000000] flex flex-col justify-between overflow-x-hidden">
      {/* 1. Procedural Vector Wave Background */}
      <ProceduralBG />

      {/* 2. Header Navigation */}
      <Nav onOpenSubscribe={() => setOpenSubscribe(true)} />

      {/* 3. Hero & Main Content */}
      <main className="flex-1 max-w-[1553px] w-full mx-auto px-6 md:px-12 lg:px-16 pt-10 pb-20 flex flex-col items-center justify-center text-center">
        {/* Main Headline (Kaisei Decol Medium 500, 50px) */}
        <h1 className="font-[family-name:var(--font-kaisei)] font-medium text-[34px] md:text-[44px] lg:text-[50px] text-[#000000] max-w-[1027px] leading-[1.2] lg:leading-[72.4px] tracking-normal">
          Get Latest AI News, Daily, On your E-mail
        </h1>

        {/* Subtitle Description (Instrument Sans Regular 400, 20px, #000000, non-italic) */}
        <p className="mt-6 font-[family-name:var(--font-instrument)] font-normal text-[16px] md:text-[20px] text-[#000000] max-w-[795px] leading-[27.8px] text-center">
          &ldquo;Byte Daily uses AI to discover, summarize, and curate the news that matters to you. Delivering a personalized briefing straight to your inbox.&rdquo;
        </p>

        {/* Hero CTA Subscribe Button (Kaisei Decol Bold, 24px, #342d38, radius 9px) */}
        <div className="mt-8">
          <button
            onClick={() => setOpenSubscribe(true)}
            className="w-[217px] h-[57px] bg-[#342d38] hover:bg-[#251f28] text-[#f4fff3] font-[family-name:var(--font-kaisei)] font-bold text-[22px] md:text-[24px] rounded-[9px] inline-flex items-center justify-center gap-3 transition-all shadow-md hover:shadow-lg active:scale-95 group"
          >
            {/* Newsletter Icon */}
            <svg
              className="w-5 h-5 text-[#f4fff3] group-hover:scale-110 transition-transform"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
            <span>Subscribe</span>
          </button>
        </div>

        {/* 4. 3x Feature Cards Showcase Grid (Exact Figma 15px radius) */}
        <div className="mt-16 md:mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full max-w-[1553px]">
          {/* Card 1: Gold Email Briefing */}
          <div className="group relative rounded-[15px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-transparent">
            <Image
              src="/images/hero_card_7_70.png"
              alt="Daily Email Briefing"
              width={498}
              height={534}
              quality={100}
              priority
              className="w-full h-auto object-cover rounded-[15px]"
            />
          </div>

          {/* Card 2: Sage Zero-LLM Summaries */}
          <div className="group relative rounded-[15px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-transparent">
            <Image
              src="/images/hero_card_8_72.png"
              alt="Zero-LLM Summaries"
              width={498}
              height={534}
              quality={100}
              priority
              className="w-full h-auto object-cover rounded-[15px]"
            />
          </div>

          {/* Card 3: Ocean Blue AI Research */}
          <div className="group relative rounded-[15px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-transparent">
            <Image
              src="/images/hero_card_8_76.png"
              alt="Curated AI Research"
              width={498}
              height={534}
              quality={100}
              priority
              className="w-full h-auto object-cover rounded-[15px]"
            />
          </div>
        </div>

        {/* 5. Our News Sources Banner (Instrument Sans 25px Medium, Title Case) */}
        <section id="about" className="mt-24 w-full max-w-[1553px] flex flex-col items-center">
          <h2 className="font-[family-name:var(--font-instrument)] font-medium text-[22px] md:text-[25px] text-[#000000] mb-8 text-center">
            Our News Sources
          </h2>

          {/* Full row of 11 news sources */}
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-11 opacity-85 hover:opacity-100 transition-opacity">
            {newsSources.map((source, idx) => (
              <div
                key={idx}
                className="h-10 flex items-center justify-center hover:scale-105 transition-all duration-200"
                title={source.name}
              >
                <Image
                  src={source.src}
                  alt={source.name}
                  width={120}
                  height={40}
                  className="max-h-8 md:max-h-9 w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </section>

        {/* 6. Exact Figma Banner Card (Radius 18px, Inter 75px + Instrument Sans 45px) */}
        <section className="mt-20 w-full max-w-[1552px] min-h-[380px] md:min-h-[438px] relative rounded-[18px] overflow-hidden text-white p-8 md:p-14 lg:p-16 flex flex-col md:flex-row items-start md:items-center justify-between shadow-2xl text-left gap-8 bg-[#182015]">
          {/* Layer 1: Base Gradient Texture */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <Image
              src="/images/banner_texture.png"
              alt="Banner Texture"
              fill
              quality={100}
              className="object-cover object-center opacity-85 mix-blend-overlay"
            />
          </div>

          {/* Layer 2: Overlay Noise Texture from Figma */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <Image
              src="/images/banner_overlay_texture.png"
              alt="Texture Overlay"
              fill
              quality={100}
              className="object-cover object-center opacity-50 mix-blend-soft-light"
            />
          </div>

          {/* Left Text Column */}
          <div className="max-w-[700px] relative z-10">
            <h2 className="font-[family-name:var(--font-inter)] font-normal text-[38px] md:text-[56px] lg:text-[75px] text-[#fbfff3] leading-[1.08] tracking-normal">
              Get Latest News
            </h2>
            <div className="mt-1 font-[family-name:var(--font-instrument)] font-semibold text-[26px] md:text-[36px] lg:text-[45px] text-[#f4fff3] leading-[1.15]">
              By Registering
            </div>
            <p className="mt-4 font-[family-name:var(--font-instrument)] font-normal text-[#e2ebd9] text-[15px] md:text-[18px] leading-relaxed max-w-lg">
              Delivering AI news, research breakthroughs, and daily briefings directly to your inbox.
            </p>
          </div>

          {/* Right Action Button */}
          <div className="shrink-0 self-start md:self-center relative z-10">
            <button
              onClick={() => setOpenSubscribe(true)}
              className="w-[200px] md:w-[229px] h-[50px] md:h-[57px] bg-white hover:bg-neutral-100 text-[#342d38] font-[family-name:var(--font-instrument)] font-semibold text-[17px] md:text-[18px] rounded-[12px] shadow-lg hover:shadow-xl transition-all active:scale-95 whitespace-nowrap flex items-center justify-center"
            >
              Subscribe Now
            </button>
          </div>
        </section>
      </main>

      {/* 7. Footer: Clean Centered Copyright */}
      <footer className="w-full max-w-[1553px] mx-auto px-6 md:px-12 py-8 flex items-center justify-center text-xs text-neutral-500 font-[family-name:var(--font-instrument)]">
        &copy; 2026 ByteDaily AI. All rights reserved.
      </footer>

      {/* Subscription Dialog Modal */}
      <NewsletterForm open={openSubscribe} onOpenChange={setOpenSubscribe} />
    </div>
  );
}