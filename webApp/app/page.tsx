"use client";

import { useState, type FormEvent } from "react";
import Nav from "@/components/nav";
import { DeviceMockup } from "@/components/device-mockup";
import RegisterModal from "@/components/register-modal";

export default function Home() {
  const [openRegisterModal, setOpenRegisterModal] = useState(false);
  const [quickEmail, setQuickEmail] = useState("");
  const [quickStatus, setQuickStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [quickMsg, setQuickMsg] = useState("");

  async function handleQuickSubscribe(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!quickEmail) return;
    setQuickStatus("submitting");
    setQuickMsg("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: quickEmail }),
      });
      const data = (await res.json()) as { message?: string };
      setQuickMsg(data.message ?? "Registered successfully!");
      setQuickStatus(res.ok ? "success" : "error");
      if (res.ok) setQuickEmail("");
    } catch {
      setQuickMsg("Something went wrong. Please try again.");
      setQuickStatus("error");
    }
  }

  return (
    /* Outer white frame — matches Figma card-with-border look */
    <div className="w-screen h-screen bg-white flex items-center justify-center p-[6px] sm:p-[8px] md:p-[10px] overflow-hidden selection:bg-neutral-900 selection:text-white">
      {/* Blue card — overflow-hidden clips phone bottom naturally */}
      <div
        className="relative w-full h-full rounded-[16px] sm:rounded-[20px] md:rounded-[24px] overflow-hidden flex flex-col bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/BG.png')" }}
      >
        {/* 1. Navbar */}
        <div className="relative z-20 w-full px-3 sm:px-5 md:px-8 pt-3 sm:pt-4 md:pt-5 shrink-0">
          <Nav onOpenSubscribe={() => setOpenRegisterModal(true)} />
        </div>

        {/* 2. Hero — compact flex section so phone sits below with proper gap at 100% zoom */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-1 sm:pt-2 shrink-0">
          {/* Headline */}
          <h1 className="font-[family-name:var(--font-questrial)] font-normal text-[32px] sm:text-[44px] md:text-[54px] lg:text-[60px] text-white leading-[1.08] tracking-tight max-w-[850px] mx-auto">
            Get Latest AI News <br />
            &amp; Be Updated
          </h1>

          {/* Subtitle */}
          <p className="mt-2 sm:mt-3 font-[family-name:var(--font-questrial)] font-normal text-[13px] sm:text-[15px] md:text-[17px] text-white/85 max-w-[540px] mx-auto leading-relaxed">
            Register and get latest news and blogs at your digital door step.
          </p>

          {/* Email Pill matching Figma Register-Field specs (658x71, 000000 20% fill, FFFFFF 80% placeholder) */}
          <div className="mt-3 sm:mt-4 md:mt-5 w-full max-w-[340px] sm:max-w-[500px] md:max-w-[620px]">
            <form
              onSubmit={handleQuickSubscribe}
              className="w-full h-[48px] sm:h-[56px] md:h-[64px] bg-[#000000]/20 backdrop-blur-xl border border-white/20 rounded-[100px] px-3 sm:px-4 flex items-center justify-between shadow-2xl transition-transform duration-200 focus-within:scale-[1.01]"
            >
              <input
                type="email"
                required
                placeholder="youremail@example.com"
                value={quickEmail}
                onChange={(e) => setQuickEmail(e.target.value)}
                disabled={quickStatus === "submitting"}
                className="flex-1 bg-transparent border-none outline-none font-[family-name:var(--font-questrial)] text-[13px] sm:text-[16px] md:text-[18px] text-white placeholder:text-white/80 px-2 sm:px-4"
              />
              <button
                type="submit"
                disabled={quickStatus === "submitting"}
                className="w-[94px] sm:w-[118px] md:w-[138px] h-[36px] sm:h-[44px] md:h-[50px] bg-white hover:bg-neutral-100 text-[#000000] font-[family-name:var(--font-questrial)] text-[13px] sm:text-[16px] md:text-[18px] font-normal rounded-[100px] flex items-center justify-center transition-all shadow-md hover:shadow-lg active:scale-95 shrink-0"
              >
                {quickStatus === "submitting" ? "..." : "Register"}
              </button>
            </form>

            {quickMsg && (
              <p className={`mt-1.5 text-xs sm:text-sm ${quickStatus === "success" ? "text-white font-medium" : "text-rose-200 font-medium"}`}>
                {quickMsg}
              </p>
            )}
          </div>
        </div>

        {/* 3. Phone — bottom-anchored with clean top gap at 100% zoom */}
        <div className="relative z-10 flex justify-center items-end flex-1 pt-3 sm:pt-4 md:pt-6 overflow-hidden">
          <DeviceMockup />
        </div>

        <RegisterModal open={openRegisterModal} onOpenChange={setOpenRegisterModal} />
      </div>
    </div>
  );
}