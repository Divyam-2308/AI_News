"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/nav";
import { SkyMeshBG } from "@/components/sky-mesh-bg";

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

function proxiedImage(image: string, w: number, h?: number): string {
  if (!image) return "/images/figma_assets/d683e2816dea32774681db86100fec3a4a51ee27.png";
  if (image.startsWith("/images/")) return image;
  const params = [`url=${encodeURIComponent(image)}`, `w=${w}`, "fit=cover", "q=80"];
  if (h) params.push(`h=${h}`);
  return `https://images.weserv.nl/?${params.join("&")}`;
}

export default function NewsDetailView({ post }: NewsDetailViewProps) {
  const [activeTab, setActiveTab] = useState<"full" | "summary">("full");

  // Editorial multi-image collage
  const mainImage = post.image || "/images/figma_assets/d683e2816dea32774681db86100fec3a4a51ee27.png";
  const subImage1 = "/images/figma_assets/8f314f6d75f9b0a3430c828e887049aa84e39b3c.png";
  const subImage2 = "/images/figma_assets/64d960d51137a9a1f048778a72a6d2092bb439e2.png";

  const paragraphs = post.content
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="relative min-h-screen text-[#000000] flex flex-col justify-between overflow-x-hidden selection:bg-neutral-900 selection:text-white pb-16">
      {/* 1. Sky Mesh Background */}
      <SkyMeshBG />

      {/* 2. Navigation */}
      <Nav />

      {/* 3. Main Controls & Content */}
      <main className="flex-1 max-w-[1737px] w-full mx-auto px-4 md:px-8 lg:px-12 py-6 space-y-6">
        {/* Top Control Bar: Back Button & Mode Tabs */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Back Button */}
          <Link
            href="/blogs"
            className="w-[143px] h-[49px] bg-[#000000] hover:bg-neutral-800 text-[#ffffff] font-[family-name:var(--font-questrial)] text-[22px] md:text-[25px] font-normal rounded-[30.5px] flex items-center justify-center gap-3 transition-transform active:scale-95 shadow-md self-start sm:self-auto"
          >
            <svg className="w-5 h-5 text-white rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <span>Back</span>
          </Link>

          {/* Centered Mode Toggle Tab */}
          <div className="w-[340px] md:w-[381px] h-[64px] md:h-[74px] bg-[#000000] rounded-[50px] md:rounded-[60px] p-2 flex items-center justify-between shadow-xl">
            {/* Full News Tab */}
            <button
              type="button"
              onClick={() => setActiveTab("full")}
              className={`h-[46px] md:h-[50px] px-6 rounded-[70px] md:rounded-[83px] font-[family-name:var(--font-questrial)] text-[18px] md:text-[22px] transition-all ${
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
              className={`h-[46px] md:h-[50px] px-6 rounded-[70px] md:rounded-[83px] font-[family-name:var(--font-questrial)] text-[18px] md:text-[22px] transition-all ${
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

        {/* 4. Main News Details Card */}
        <div className="w-full min-h-[750px] bg-[#ffffff] rounded-[24px] md:rounded-[32px] p-6 md:p-10 shadow-2xl border border-white/80 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: 3-Image Editorial Collage */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            {/* Top Large Featured Image */}
            <div className="relative w-full aspect-[864/498] rounded-[16px] md:rounded-[20px] overflow-hidden bg-neutral-100 shadow-md">
              <Image
                src={mainImage.startsWith("/images/") ? mainImage : proxiedImage(mainImage, 1000, 600)}
                alt={post.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover hover:scale-105 transition-transform duration-700"
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
                <span className="px-4 py-1 rounded-full bg-neutral-100 text-neutral-800 font-[family-name:var(--font-questrial)] text-[14px] md:text-[16px]">
                  {post.category}
                </span>
                {post.createdAt && (
                  <span className="text-neutral-500 font-[family-name:var(--font-questrial)] text-[14px] md:text-[16px]">
                    {new Date(post.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="mt-4 font-[family-name:var(--font-questrial)] text-[28px] md:text-[38px] lg:text-[42px] font-normal text-[#000000] leading-tight">
                {post.title}
              </h1>

              {/* Content Body based on Active Tab */}
              {activeTab === "full" ? (
                <div className="mt-6 space-y-5 font-[family-name:var(--font-questrial)] text-[18px] md:text-[22px] lg:text-[25px] text-[#000000] leading-relaxed max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {paragraphs.length > 0 ? (
                    paragraphs.map((para, i) => <p key={i}>{para}</p>)
                  ) : (
                    <p>{post.content}</p>
                  )}
                </div>
              ) : (
                <div className="mt-6 space-y-6 font-[family-name:var(--font-questrial)] text-[#000000] bg-neutral-50 rounded-[20px] p-6 border border-neutral-200">
                  <div className="flex items-center gap-2 text-neutral-900 font-medium text-[20px]">
                    <svg className="w-6 h-6 text-neutral-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    <span>Key AI Insights & Executive Summary</span>
                  </div>

                  <ul className="space-y-4 text-[17px] md:text-[20px] leading-relaxed list-disc list-inside text-neutral-800">
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
              <div className="pt-6 border-t border-neutral-100 flex items-center justify-between text-[15px] text-neutral-600 font-[family-name:var(--font-questrial)]">
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
    </div>
  );
}
