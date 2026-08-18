"use client";

import React from "react";

export function DeviceMockup() {
  return (
    <div className="relative w-full max-w-[300px] sm:max-w-[380px] md:max-w-[440px] select-none mx-auto">
      {/* Hardware Buttons (Left) */}
      <div className="absolute -left-[4px] top-[14%] w-[4px] h-[24px] bg-black rounded-l-[2px] z-20" />
      <div className="absolute -left-[4px] top-[24%] w-[4px] h-[40px] bg-black rounded-l-[2px] z-20" />
      {/* Hardware Button (Right) */}
      <div className="absolute -right-[4px] top-[20%] w-[4px] h-[36px] bg-black rounded-r-[2px] z-20" />

      {/* Main Phone Frame Container — negative bottom margin pushes black bottom bar past card clip edge */}
      <div
        className="relative w-full h-[340px] sm:h-[420px] md:h-[480px] rounded-t-[36px] sm:rounded-t-[44px] md:rounded-t-[50px] bg-black p-[8px] sm:p-[10px] md:p-[11px] pb-12 -mb-8 sm:-mb-10 md:-mb-12"
      >
        {/* Dynamic Island */}
        <div className="absolute top-[12px] left-1/2 -translate-x-1/2 w-[90px] sm:w-[110px] md:w-[124px] h-[22px] sm:h-[26px] md:h-[28px] bg-black rounded-full z-40 flex items-center justify-end px-2.5">
          <div className="w-[8px] h-[8px] sm:w-[10px] sm:h-[10px] rounded-full bg-[#181818] border border-neutral-700" />
        </div>

        {/* ── INNER PHONE SCREEN (Clipping Inner Radius) ── */}
        <div className="relative w-full h-full rounded-t-[28px] sm:rounded-t-[34px] md:rounded-t-[40px] overflow-hidden isolate transform-gpu">
          
          {/* 1. Exact Figma Background Image: /images/App Image.png */}
          <div className="absolute inset-0 z-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/App Image.png"
              alt="App Background"
              className="w-full h-full object-cover object-top opacity-75 filter blur-[4px] scale-105"
            />
          </div>

          {/* 2. Light Sky Blue Gradient matching Home.png */}
          <div className="absolute inset-0 bg-white/10 bg-gradient-to-b from-[#9cd4f4]/85 via-[#68b2e3]/90 to-[#4596d0]/95 z-10" />

          {/* 3. Foreground Content (Envelope Graphic + Text matching Home.png) */}
          <div className="relative z-20 w-full h-full flex flex-col items-center justify-center pt-4 pb-8 px-4 text-center">

            {/* Open Envelope Graphic — Sleek size matching Home.png */}
            <div className="w-[76px] h-[66px] sm:w-[94px] sm:h-[82px] md:w-[108px] md:h-[94px] mb-3 sm:mb-4">
              <svg className="w-full h-full drop-shadow-sm" viewBox="0 0 148 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Envelope Base Body + Rounded Roof Top */}
                <path
                  d="M 14 36 C 14 36 74 6 134 36 C 142 40 142 46 142 54 L 142 96 C 142 112 124 122 108 122 L 40 122 C 24 122 6 112 6 96 L 6 54 C 6 46 6 40 14 36 Z"
                  fill="white"
                />
                
                {/* Upper Flap Fold Stroke with Central Arch */}
                <path
                  d="M 6 42 L 62 62 Q 74 66 86 62 L 142 42"
                  stroke="#68b4e4"
                  strokeWidth="9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Lower Left & Right Diagonal Fold Lines */}
                <path
                  d="M 28 88 L 62 64"
                  stroke="#68b4e4"
                  strokeWidth="9"
                  strokeLinecap="round"
                />
                <path
                  d="M 120 88 L 86 64"
                  stroke="#68b4e4"
                  strokeWidth="9"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Typography matching Figma Home.png */}
            <div className="space-y-0.5 text-white">
              <p className="font-[family-name:var(--font-questrial)] font-normal text-[14px] sm:text-[16px] md:text-[18px] tracking-wide drop-shadow-sm leading-tight">
                Signup &amp; Standup in crowd
              </p>
              <p className="font-[family-name:var(--font-questrial)] text-[13px] sm:text-[15px] md:text-[17px] text-white/95 leading-tight flex items-center justify-center gap-1">
                <span>with</span>
                <span className="font-[family-name:var(--font-caveat)] text-[17px] sm:text-[20px] md:text-[23px] font-normal leading-none -mt-0.5">
                  knowlege
                </span>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
