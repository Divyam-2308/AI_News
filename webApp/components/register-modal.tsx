"use client";

import React, { useState, type FormEvent } from "react";

interface RegisterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Status = "idle" | "submitting" | "success" | "error";

export default function RegisterModal({ open, onOpenChange }: RegisterModalProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [agree, setAgree] = useState(true);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  if (!open) return null;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!agree) {
      setMessage("Please accept the Terms & Conditions to proceed.");
      setStatus("error");
      return;
    }

    setStatus("submitting");
    setMessage("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: username, email }),
      });
      const data = (await res.json()) as { message?: string };
      setMessage(data.message ?? "Successfully registered for daily briefings!");
      setStatus(res.ok ? "success" : "error");
      if (res.ok) {
        setTimeout(() => {
          onOpenChange(false);
          setStatus("idle");
          setUsername("");
          setEmail("");
          setMessage("");
        }, 1800);
      }
    } catch {
      setMessage("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      {/* Centered Modal Card Container matching Figma Screenshot */}
      <div className="relative w-full max-w-[560px] bg-white rounded-[38px] md:rounded-[46px] shadow-2xl overflow-hidden flex flex-col items-center pb-8 border border-white/40">
        {/* Top Header Graphic Banner (Sky blue textured mesh) */}
        <div className="relative w-full h-[95px] bg-gradient-to-r from-[#62b0e6] via-[#85ccf8] to-[#62b0e6] flex items-center justify-center overflow-hidden">
          {/* Subtle Radial Glow */}
          <div className="absolute inset-0 bg-radial from-white/35 via-transparent to-transparent pointer-events-none" />

          {/* Centered Document / Newsletter Badge Icon */}
          <div className="relative w-[50px] h-[48px] bg-white/20 backdrop-blur-md rounded-[14px] border border-white/40 flex items-center justify-center shadow-sm">
            <svg
              className="w-6 h-6 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
        </div>

        {/* Close Button Top Right */}
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 w-[34px] h-[34px] bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white shadow transition-all z-20"
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Headings */}
        <div className="mt-6 text-center px-6">
          <h3 className="font-[family-name:var(--font-questrial)] text-[24px] md:text-[26px] font-normal text-[#1a1a1a]">
            Register
          </h3>
          <p className="mt-1 font-[family-name:var(--font-questrial)] text-[14px] md:text-[15px] text-[#6b7280]">
            Register for Daily Newsletters &amp; Knowledge
          </p>
        </div>

        {/* Status Message */}
        {message && (
          <div
            className={`mt-3 mx-6 px-4 py-2 text-sm rounded-xl text-center w-[calc(100%-48px)] ${
              status === "success"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-rose-50 text-rose-700 border border-rose-200"
            }`}
          >
            {message}
          </div>
        )}

        {/* Form Elements */}
        <form onSubmit={handleSubmit} className="mt-5 w-full px-6 md:px-12 flex flex-col gap-4">
          {/* Username Input */}
          <div className="flex flex-col gap-1 text-left">
            <label className="font-[family-name:var(--font-questrial)] text-[14px] md:text-[15px] text-[#1a1a1a] font-normal">
              Enter Your Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              disabled={status === "submitting"}
              className="w-full h-[44px] px-4 rounded-[12px] border border-neutral-300 bg-white text-neutral-900 placeholder:text-[#a0a0a0] focus:outline-none focus:ring-2 focus:ring-sky-400 font-[family-name:var(--font-questrial)] text-[15px] transition-all"
            />
          </div>

          {/* Email Input */}
          <div className="flex flex-col gap-1 text-left">
            <label className="font-[family-name:var(--font-questrial)] text-[14px] md:text-[15px] text-[#1a1a1a] font-normal">
              Enter Your Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="youremail@example.com"
              disabled={status === "submitting"}
              className="w-full h-[44px] px-4 rounded-[12px] border border-neutral-300 bg-white text-neutral-900 placeholder:text-[#a0a0a0] focus:outline-none focus:ring-2 focus:ring-sky-400 font-[family-name:var(--font-questrial)] text-[15px] transition-all"
            />
          </div>

          {/* Terms & Conditions Checkbox */}
          <div className="flex items-center gap-3 mt-1 cursor-pointer" onClick={() => setAgree(!agree)}>
            <div
              className={`w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center transition-colors ${
                agree ? "bg-neutral-800 border-neutral-800 text-white" : "bg-[#e5e5e5] border-neutral-300"
              }`}
            >
              {agree && (
                <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <span className="font-[family-name:var(--font-questrial)] text-[13px] md:text-[14px] text-[#333333] select-none leading-snug">
              I accept Terms &amp; Condition and Privacy Policy of AI-News
            </span>
          </div>

          {/* Sky Blue Gradient Register CTA Button */}
          <div className="mt-3 w-full">
            <button
              type="submit"
              disabled={status === "submitting"}
              className="relative w-full h-[52px] md:h-[56px] rounded-[55px] overflow-hidden shadow-lg hover:shadow-xl transition-all active:scale-98 flex items-center justify-center bg-gradient-to-r from-[#4ca2e0] via-[#6ec2f7] to-[#409ad9] hover:opacity-95 text-white font-[family-name:var(--font-questrial)] text-[20px] md:text-[22px] font-normal tracking-wide drop-shadow disabled:opacity-70"
            >
              {status === "submitting" ? "Registering..." : "Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
