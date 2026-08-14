"use client";

import React, { useEffect, useRef } from "react";

export function ProceduralBG() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const renderPattern = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = Math.max(
        document.documentElement.scrollHeight,
        window.innerHeight,
        2400
      );

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);

      // Cream base background
      ctx.fillStyle = "#fcfdf4";
      ctx.fillRect(0, 0, width, height);

      // Horizontal flowing wave lines matching BG Texture.png from Figma
      // Lines flow left-to-right with gentle organic vertical undulation
      ctx.strokeStyle = "rgba(100, 115, 80, 0.18)";
      ctx.lineWidth = 0.8;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const lineSpacing = 11; // tight spacing like Figma
      const totalLines = Math.ceil(height / lineSpacing) + 2;

      for (let i = 0; i < totalLines; i++) {
        const baseY = i * lineSpacing;

        ctx.beginPath();

        const steps = Math.ceil(width / 3);
        for (let s = 0; s <= steps; s++) {
          const x = (s / steps) * width;

          // Multi-frequency organic wave distortion along X-axis
          // Matching the flowing topographic style from BG Texture.png
          const t = x / width;
          const wave1 = Math.sin(t * Math.PI * 4.2 + i * 0.31) * 9;
          const wave2 = Math.cos(t * Math.PI * 7.8 - i * 0.17) * 5;
          const wave3 = Math.sin(t * Math.PI * 13.5 + i * 0.43) * 2.5;
          const wave4 = Math.cos(t * Math.PI * 2.1 + i * 0.08) * 11;

          const y = baseY + wave1 + wave2 + wave3 + wave4;

          if (s === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
      }
    };

    renderPattern();

    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(renderPattern, 120);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none bg-[#fcfdf4]">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
