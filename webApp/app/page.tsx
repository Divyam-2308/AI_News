"use client";

import { useState } from "react";
import Image from "next/image";
import Nav from "@/components/nav";
import { ProceduralBG } from "@/components/procedural-bg";
import NewsletterForm from "@/components/form";

export default function Home() {
  const [openSubscribe, setOpenSubscribe] = useState(false);

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
    <div className="relative min-h-screen text-neutral-900 flex flex-col justify-between overflow-x-hidden">
      {/* 1. Procedural Vector SVG Wave Background (Code-driven) */}
      <ProceduralBG />

      {/* 2. Top Navigation */}
      <Nav onOpenSubscribe={() => setOpenSubscribe(true)} />

      {/* 3. Main Hero Content with generous left-right margins */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-8 md:px-16 lg:px-24 pt-12 pb-24 flex flex-col items-center justify-center text-center">
        {/* Prominent Hero Headline */}
        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-neutral-900 max-w-5xl leading-[1.1]">
          Get Latest AI News, Daily, On your E-mail
        </h1>

        {/* Larger Subtitle / Description */}
        <p className="mt-8 text-lg md:text-xl lg:text-2xl text-neutral-600 italic font-sans max-w-3xl leading-relaxed">
          &ldquo;Byte Daily uses AI to discover, summarize, and curate the news that matters to you. Delivering a personalized briefing straight to your inbox.&rdquo;
        </p>

        {/* Larger Hero Subscribe CTA Button */}
        <div className="mt-10">
          <button
            onClick={() => setOpenSubscribe(true)}
            className="inline-flex items-center gap-3.5 bg-[#272e25] hover:bg-[#1a2019] text-white text-lg md:text-xl font-semibold px-9 py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-95 group"
          >
            {/* Newsletter Icon */}
            <svg
              className="w-6 h-6 opacity-95 group-hover:scale-110 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
            <span>Subscribe</span>
          </button>
        </div>

        {/* 4. Prominent 3x Feature Showcase Cards Grid */}
        <div className="mt-20 md:mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 w-full max-w-6xl">
          {/* Card 1: Gold / Yellow Email Digest */}
          <div className="group relative rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <Image
              src="/images/hero_card_7_70.png"
              alt="Daily Email Briefing"
              width={600}
              height={600}
              quality={100}
              priority
              className="w-full h-auto object-cover rounded-3xl"
            />
          </div>

          {/* Card 2: Emerald / Sage Summaries */}
          <div className="group relative rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <Image
              src="/images/hero_card_8_72.png"
              alt="Zero-LLM Summaries"
              width={600}
              height={600}
              quality={100}
              priority
              className="w-full h-auto object-cover rounded-3xl"
            />
          </div>

          {/* Card 3: Ocean Blue AI Research */}
          <div className="group relative rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <Image
              src="/images/hero_card_8_76.png"
              alt="Curated AI Research"
              width={600}
              height={600}
              quality={100}
              priority
              className="w-full h-auto object-cover rounded-3xl"
            />
          </div>
        </div>

        {/* 5. Our News Sources Banner */}
        <section id="about" className="mt-28 w-full max-w-6xl pt-10 border-t border-neutral-300/50">
          <h2 className="text-base font-semibold tracking-wider text-neutral-700 uppercase mb-10">
            Our News Sources
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-10 md:gap-14 opacity-85 hover:opacity-100 transition-opacity">
            {newsSources.map((source, idx) => (
              <div
                key={idx}
                className="h-10 flex items-center justify-center grayscale contrast-125 hover:grayscale-0 hover:scale-110 transition-all duration-200"
                title={source.name}
              >
                <Image
                  src={source.src}
                  alt={source.name}
                  width={120}
                  height={40}
                  className="max-h-9 md:max-h-10 w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-neutral-500 border-t border-neutral-200/50">
        &copy; {new Date().getFullYear()} ByteDaily AI. All rights reserved.
      </footer>

      {/* Subscription Dialog Modal */}
      <NewsletterForm open={openSubscribe} onOpenChange={setOpenSubscribe} />
    </div>
  );
}