"use client";

import React from "react";

export function DeviceMockup() {
  return (
    <div className="relative w-full max-w-[535px] h-[340px] sm:h-[400px] md:h-[480px] flex items-center justify-center select-none group mx-auto">
      {/* Side Hardware Buttons (Left) */}
      <div className="absolute -left-[5px] top-[35%] w-[8px] h-[34px] bg-black rounded-l-[4px]" />
      <div className="absolute -left-[5px] top-[48%] w-[8px] h-[56px] bg-black rounded-l-[4px]" />

      {/* Side Hardware Buttons (Right) */}
      <div className="absolute -right-[5px] top-[40%] w-[8px] h-[48px] bg-black rounded-r-[4px]" />

      {/* Main Device Outer Frame (Heavy black bezel with rounded top) */}
      <div className="relative w-full h-full rounded-t-[44px] md:rounded-t-[52px] overflow-hidden border-[10px] md:border-[14px] border-b-0 border-black shadow-2xl bg-[#71b6e4]">
        {/* Dynamic Island / Top Notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[130px] md:w-[150px] h-[30px] md:h-[36px] bg-black rounded-full z-20 flex items-center justify-end px-4 shadow-md">
          <div className="w-[12px] h-[12px] rounded-full bg-[#1d1c1c] border-2 border-neutral-700" />
        </div>

        {/* Screen Background with Soft Blue Gradient & Glass Highlights */}
        <div className="relative w-full h-full bg-gradient-to-b from-[#60a9dd] via-[#75bde9] to-[#519fd6] flex flex-col items-center justify-center p-6 pt-16">
          {/* Subtle Ambient Background Shapes inside phone */}
          <div className="absolute top-1/4 -left-10 w-48 h-48 bg-white/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-10 -right-10 w-48 h-48 bg-white/20 rounded-full blur-2xl pointer-events-none" />

          {/* Central Mail / Newsletter Graphic Icon */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Open Envelope Icon matching Figma */}
            <div className="w-[84px] h-[72px] md:w-[100px] md:h-[86px] relative flex items-center justify-center text-white drop-shadow-md mb-5">
              <svg
                className="w-full h-full"
                viewBox="0 0 100 86"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Envelope Body */}
                <path
                  d="M12 28C12 21.3726 17.3726 16 24 16H76C82.6274 16 88 21.3726 88 28V62C88 68.6274 82.6274 74 76 74H24C17.3726 74 12 68.6274 12 62V28Z"
                  fill="white"
                />
                {/* Envelope Flap Cutout */}
                <path
                  d="M16 24L50 48L84 24"
                  stroke="#60a9dd"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Knowledge Text Lines */}
            <div className="text-center space-y-1">
              <p className="font-[family-name:var(--font-questrial)] font-normal text-[20px] md:text-[23px] text-white tracking-wide drop-shadow">
                Signup &amp; Standup in crowd
              </p>
              <p className="font-[family-name:var(--font-questrial)] text-[18px] md:text-[21px] text-white/95">
                with <span className="font-serif italic font-normal tracking-wide">knowledge</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
