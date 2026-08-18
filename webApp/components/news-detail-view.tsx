"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/nav";

interface NewsDetailViewProps {
  post: {
    id: string;
    title: string;
    content: string;
    image: string;
    category: string;
    sourceName: string;
    sourceUrl: string;
    createdAt: string | null;
  };
}

const DEFAULT_FALLBACK_IMAGE = "/images/figma_assets/d683e2816dea32774681db86100fec3a4a51ee27.png";

function proxiedImage(image: string, w: number, h?: number): string {
  if (!image) return DEFAULT_FALLBACK_IMAGE;
  if (image.startsWith("/images/") || image.startsWith("/")) return image;

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
  if (cloudName && (image.startsWith("http://") || image.startsWith("https://"))) {
    const transforms = [`w_${w}`, `c_fill`, `q_auto`, `f_auto`];
    if (h) transforms.push(`h_${h}`);
    return `https://res.cloudinary.com/${cloudName}/image/fetch/${transforms.join(",")}/${encodeURIComponent(image)}`;
  }

  const params = [`url=${encodeURIComponent(image)}`, `w=${w}`, "fit=cover", "q=80"];
  if (h) params.push(`h=${h}`);
  return `https://images.weserv.nl/?${params.join("&")}`;
}

export default function NewsDetailView({ post }: NewsDetailViewProps) {
  const [activeTab, setActiveTab] = useState<"full" | "summary">("full");

  // Editorial multi-image collage
  const mainImage = post.image || DEFAULT_FALLBACK_IMAGE;
  const subImage1 = "/images/figma_assets/8f314f6d75f9b0a3430c828e887049aa84e39b3c.png";
  const subImage2 = "/images/figma_assets/64d960d51137a9a1f048778a72a6d2092bb439e2.png";

  const paragraphs = post.content
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    /* Outer white border frame — consistent across all pages */
    <div className="w-screen min-h-screen bg-white flex items-center justify-center p-[6px] sm:p-[8px] md:p-[10px] selection:bg-neutral-900 selection:text-white">
      {/* Inner Blue Card — consistent background */}
      <div
        className="relative w-full min-h-[calc(100vh-20px)] rounded-[16px] sm:rounded-[20px] md:rounded-[24px] overflow-hidden flex flex-col justify-between bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/BG.png')" }}
      >
        {/* 1. Navigation Wrapper */}
        <div className="relative z-20 w-full px-3 sm:px-5 md:px-8 pt-3 sm:pt-4 md:pt-5 shrink-0">
          <Nav />
        </div>

        {/* 2. Main Controls & Content */}
        <main className="relative z-10 flex-1 max-w-[1737px] w-full mx-auto px-4 md:px-8 lg:px-12 py-6 space-y-6">
          {/* Top Control Bar: Back Button & Mode Tabs */}
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Back Button */}
            <Link
              href="/blogs"
              className="w-[130px] sm:w-[143px] h-[45px] sm:h-[49px] bg-[#000000] hover:bg-neutral-800 text-[#ffffff] font-[family-name:var(--font-questrial)] text-[20px] sm:text-[23px] font-normal rounded-[100px] flex items-center justify-center gap-2.5 transition-transform active:scale-95 shadow-md self-start sm:self-auto"
            >
              <svg className="w-4 h-4 text-white rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <span>Back</span>
            </Link>

            {/* Centered Mode Toggle Tab */}
            <div className="w-[310px] md:w-[360px] h-[58px] md:h-[68px] bg-[#000000] rounded-[100px] p-1.5 flex items-center justify-between shadow-xl">
              {/* Full News Tab */}
              <button
                type="button"
                onClick={() => setActiveTab("full")}
                className={`h-[44px] md:h-[52px] px-6 rounded-[100px] font-[family-name:var(--font-questrial)] text-[16px] md:text-[20px] transition-all ${
                  activeTab === "full"
                    ? "bg-[#ffffff] text-[#000000] shadow-md font-medium"
                    : "bg-transparent text-[#ffffff] hover:text-white/80"
                }`}
              >
                Full News
              </button>

              {/* AI Summary Tab */}
              <button
                type="button"
                onClick={() => setActiveTab("summary")}
                className={`h-[44px] md:h-[52px] px-6 rounded-[100px] font-[family-name:var(--font-questrial)] text-[16px] md:text-[20px] transition-all ${
                  activeTab === "summary"
                    ? "bg-[#ffffff] text-[#000000] shadow-md font-medium"
                    : "bg-transparent text-[#ffffff] hover:text-white/80"
                }`}
              >
                AI Summary
              </button>
            </div>

            {/* Spacer for symmetry on desktop */}
            <div className="hidden sm:block w-[143px]" />
          </div>

          {/* 3. Main News Details Card */}
          <div className="w-full min-h-[650px] bg-[#ffffff] rounded-[24px] md:rounded-[32px] p-6 md:p-10 shadow-2xl border border-white/80 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: 3-Image Editorial Collage */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              {/* Top Large Featured Image */}
              <div className="relative w-full aspect-[864/498] rounded-[18px] md:rounded-[22px] overflow-hidden bg-neutral-100 shadow-md">
                <Image
                  src={mainImage.startsWith("/images/") ? mainImage : proxiedImage(mainImage, 1000, 600)}
                  alt={post.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  unoptimized={mainImage.startsWith("/images/")}
                />
              </div>

              {/* Bottom 2 Supporting Images Grid */}
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-5 relative aspect-[373/249] rounded-[14px] md:rounded-[18px] overflow-hidden bg-neutral-100 shadow-sm">
                  <Image
                    src={subImage1}
                    alt="Context visual 1"
                    fill
                    sizes="(max-width: 1024px) 50vw, 20vw"
                    className="object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="col-span-7 relative aspect-[473/249] rounded-[14px] md:rounded-[18px] overflow-hidden bg-neutral-100 shadow-sm">
                  <Image
                    src={subImage2}
                    alt="Context visual 2"
                    fill
                    sizes="(max-width: 1024px) 50vw, 30vw"
                    className="object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Article Details / AI Summary */}
            <div className="lg:col-span-6 flex flex-col justify-between h-full space-y-6">
              <div>
                {/* Category & Date metadata */}
                <div className="flex items-center gap-3">
                  <span className="px-4 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-100 font-[family-name:var(--font-questrial)] text-[13px] md:text-[15px]">
                    {post.category}
                  </span>
                  {post.createdAt && (
                    <span className="text-neutral-500 font-[family-name:var(--font-questrial)] text-[13px] md:text-[15px]">
                      {new Date(post.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="mt-4 font-[family-name:var(--font-questrial)] text-[26px] md:text-[34px] lg:text-[38px] font-normal text-[#000000] leading-tight">
                  {post.title}
                </h1>

                {/* Content Body based on Active Tab */}
                {activeTab === "full" ? (
                  <div className="mt-5 space-y-4 font-[family-name:var(--font-questrial)] text-[16px] md:text-[19px] text-[#222222] leading-relaxed max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                    {paragraphs.length > 0 ? (
                      paragraphs.map((para, i) => <p key={i}>{para}</p>)
                    ) : (
                      <p>{post.content}</p>
                    )}
                  </div>
                ) : (
                  <div className="mt-5 space-y-5 font-[family-name:var(--font-questrial)] text-[#000000] bg-neutral-50 rounded-[20px] p-6 border border-neutral-200">
                    <div className="flex items-center gap-2 text-neutral-900 font-medium text-[18px] md:text-[20px]">
                      <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      <span>Key AI Insights &amp; Executive Summary</span>
                    </div>

                    <ul className="space-y-3.5 text-[15px] md:text-[18px] leading-relaxed list-disc list-inside text-neutral-700">
                      <li>
                        <strong className="text-black">Core Subject:</strong> {post.title}
                      </li>
                      <li>
                        <strong className="text-black">Impact Analysis:</strong> Highlights major shifts across autonomous agent capabilities and AI deployment benchmarks.
                      </li>
                      <li>
                        <strong className="text-black">Key Takeaway:</strong> Continues rapid evolution toward practical enterprise utility with refined safety guardrails.
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Source Reference Footer */}
              {post.sourceUrl && (
                <div className="pt-5 border-t border-neutral-100 flex items-center justify-between text-[14px] text-neutral-500 font-[family-name:var(--font-questrial)]">
                  <span>
                    Source:{" "}
                    <a
                      href={post.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-black underline underline-offset-4 hover:opacity-80"
                    >
                      {post.sourceName || "Original Article"}
                    </a>
                  </span>
                  <span className="text-neutral-400">Verified AI-News Digest</span>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 w-full max-w-[1737px] mx-auto px-6 md:px-12 py-6 flex items-center justify-between text-xs md:text-sm text-white/80 font-[family-name:var(--font-questrial)]">
          <span>&copy; 2026 AI-News. All rights reserved.</span>
          <span>Curated with automated multi-agent intelligence.</span>
        </footer>
      </div>
    </div>
  );
}
