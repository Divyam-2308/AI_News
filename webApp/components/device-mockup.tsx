"use client";

import React from "react";

export function DeviceMockup() {
  return (
    <div className="relative w-full max-w-[340px] sm:max-w-[440px] md:max-w-[540px] lg:max-w-[620px] select-none mx-auto">
      {/* Hardware Buttons (Left) */}
      <div className="absolute -left-[5px] top-[14%] w-[5px] h-[28px] bg-black rounded-l-[3px] z-20" />
      <div className="absolute -left-[5px] top-[24%] w-[5px] h-[48px] bg-black rounded-l-[3px] z-20" />
      {/* Hardware Button (Right) */}
      <div className="absolute -right-[5px] top-[20%] w-[5px] h-[42px] bg-black rounded-r-[3px] z-20" />

      {/* Main Phone Frame Container */}
      <div
        className="relative w-full h-[340px] sm:h-[420px] md:h-[480px] lg:h-[520px] rounded-t-[44px] sm:rounded-t-[52px] md:rounded-t-[60px] bg-black p-[9px] sm:p-[11px] md:p-[13px] pb-0"
      >
        {/* Dynamic Island */}
        <div className="absolute top-[14px] left-1/2 -translate-x-1/2 w-[110px] sm:w-[130px] md:w-[150px] h-[28px] sm:h-[32px] md:h-[36px] bg-black rounded-full z-40 flex items-center justify-end px-3">
          <div className="w-[10px] h-[10px] sm:w-[12px] sm:h-[12px] rounded-full bg-[#181818] border border-neutral-700" />
        </div>

        {/* ── INNER PHONE SCREEN (Clipping Inner Radius) ── */}
        <div className="relative w-full h-full rounded-t-[34px] sm:rounded-t-[40px] md:rounded-t-[48px] overflow-hidden isolate transform-gpu">
          
          {/* 1. Exact Figma Background Image: /images/App Image.png */}
          <div className="absolute inset-0 z-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/App Image.png"
              alt="App Background"
              className="w-full h-full object-cover object-top opacity-75 filter blur-[5px] scale-105"
            />
          </div>

          {/* 2. Light Sky Blue Gradient matching Device.png */}
          <div className="absolute inset-0 bg-white/10 bg-gradient-to-b from-[#9cd4f4]/85 via-[#68b2e3]/90 to-[#4596d0]/95 z-10" />

          {/* 3. Foreground Content (Envelope Graphic + Text matching Content.png) */}
          <div className="relative z-20 w-full h-full flex flex-col items-center justify-center pt-6 pb-10 px-6 text-center">

            {/* Open Envelope Graphic — Exact Replica of Content.png */}
            <div className="w-[108px] h-[94px] sm:w-[138px] sm:h-[118px] md:w-[160px] md:h-[136px] mb-5">
              <svg className="w-full h-full drop-shadow-sm" viewBox="0 0 148 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Envelope Base Body + Rounded Roof Top */}
                <path
                  d="M 14 36 C 14 36 74 6 134 36 C 142 40 142 46 142 54 L 142 96 C 142 112 124 122 108 122 L 40 122 C 24 122 6 112 6 96 L 6 54 C 6 46 6 40 14 36 Z"
                  fill="white"
                />
                
                {/* Upper Flap Fold Stroke with Central Arch (Content.png match) */}
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

            {/* Typography matching Figma Content.png */}
            <div className="space-y-1 text-white">
              <p className="font-[family-name:var(--font-questrial)] font-normal text-[19px] sm:text-[23px] md:text-[26px] tracking-wide drop-shadow-sm leading-tight">
                Signup &amp; Standup in crowd
              </p>
              <p className="font-[family-name:var(--font-questrial)] text-[17px] sm:text-[20px] md:text-[23px] text-white/95 leading-tight flex items-center justify-center gap-1.5">
                <span>with</span>
                <span className="font-[family-name:var(--font-caveat)] text-[22px] sm:text-[27px] md:text-[31px] font-normal leading-none -mt-1">
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
