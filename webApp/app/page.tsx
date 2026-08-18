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
      if (res.ok) {
        setQuickEmail("");
      }
    } catch {
      setQuickMsg("Something went wrong. Please try again.");
      setQuickStatus("error");
    }
  }

  return (
    <div className="w-screen min-h-screen bg-[#ffffff] flex items-center justify-center p-2 sm:p-3 md:p-4 overflow-hidden selection:bg-neutral-900 selection:text-white">
      {/* Edge-to-Edge Responsive Blue Card Container */}
      <div
        className="relative w-full h-[calc(100vh-16px)] sm:h-[calc(100vh-24px)] md:h-[calc(100vh-32px)] rounded-[18px] sm:rounded-[22px] md:rounded-[26px] overflow-hidden shadow-2xl flex flex-col justify-between items-center text-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/BG.png')" }}
      >
        {/* 1. Floating Glass Navbar at the Top */}
        <div className="relative z-10 w-full px-2 sm:px-4 md:px-6 pt-2 sm:pt-3 md:pt-4">
          <Nav onOpenSubscribe={() => setOpenRegisterModal(true)} />
        </div>

        {/* 2. Hero Center Section */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full px-4 py-2">
          {/* Main Headline */}
          <h1 className="font-[family-name:var(--font-questrial)] font-normal text-[36px] sm:text-[46px] md:text-[56px] lg:text-[64px] text-[#ffffff] leading-[1.08] tracking-tight max-w-[850px] mx-auto drop-shadow-md">
            Get Latest AI News <br />
            &amp; Be Updated
          </h1>

          {/* Subtitle */}
          <p className="mt-3 md:mt-4 font-[family-name:var(--font-questrial)] font-normal text-[15px] sm:text-[18px] md:text-[21px] text-[#ffffff] max-w-[750px] mx-auto leading-relaxed drop-shadow-sm px-4">
            Register and get latest news and blogs at your digital door step.
          </p>

          {/* Centered Frosted Glass Email Pill */}
          <div className="mt-5 md:mt-7 w-full max-w-[560px] px-2">
            <form
              onSubmit={handleQuickSubscribe}
              className="w-full h-[54px] sm:h-[60px] md:h-[66px] bg-[#000000]/25 backdrop-blur-xl border border-white/25 rounded-[76px] px-3 md:px-3.5 flex items-center justify-between shadow-2xl transition-transform duration-200 focus-within:scale-[1.01]"
            >
              <input
                type="email"
                required
                placeholder="youremail@example.com"
                value={quickEmail}
                onChange={(e) => setQuickEmail(e.target.value)}
                disabled={quickStatus === "submitting"}
                className="flex-1 bg-transparent border-none outline-none font-[family-name:var(--font-questrial)] text-[15px] sm:text-[17px] md:text-[20px] text-[#ffffff] placeholder:text-[#ffffff]/80 px-3 md:px-4"
              />

              <button
                type="submit"
                disabled={quickStatus === "submitting"}
                className="w-[105px] sm:w-[125px] md:w-[140px] h-[38px] sm:h-[44px] md:h-[48px] bg-[#ffffff] hover:bg-neutral-100 text-[#000000] font-[family-name:var(--font-questrial)] text-[15px] sm:text-[17px] md:text-[20px] font-normal rounded-[76px] flex items-center justify-center transition-all shadow-md hover:shadow-lg active:scale-95 shrink-0"
              >
                {quickStatus === "submitting" ? "..." : "Register"}
              </button>
            </form>

            {/* Status feedback */}
            {quickMsg && (
              <p
                className={`mt-2 text-sm ${
                  quickStatus === "success" ? "text-emerald-950 font-medium" : "text-rose-950 font-medium"
                }`}
              >
                {quickMsg}
              </p>
            )}
          </div>
        </div>

        {/* 3. Phone Mockup firmly anchored to the bottom edge */}
        <div className="relative z-10 w-full max-w-[440px] sm:max-w-[490px] md:max-w-[535px] flex justify-center shrink-0 -mb-0.5">
          <DeviceMockup />
        </div>
      </div>

      {/* Global Register Modal */}
      <RegisterModal open={openRegisterModal} onOpenChange={setOpenRegisterModal} />
    </div>
  );
}