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
      const height = Math.max(window.innerHeight, 1400);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);

      // Background base tone
      ctx.fillStyle = "#fcfdf4";
      ctx.fillRect(0, 0, width, height);

      // Render Horizontal Organic Flowing Waves (Matching Figma Wave Texture)
      ctx.strokeStyle = "#9bb07b";
      ctx.lineWidth = 0.95;
      ctx.globalAlpha = 0.42;

      const rowSpacing = 14; // Vertical distance between waves
      const totalRows = Math.ceil(height / rowSpacing) + 10;

      for (let i = 0; i < totalRows; i++) {
        const baseY = i * rowSpacing - 20;

        ctx.beginPath();
        const steps = 300;

        for (let s = 0; s <= steps; s++) {
          const x = (s / steps) * width;

          // Multi-frequency organic horizontal wave formula
          const wave1 = Math.sin((x / width) * Math.PI * 4 + i * 0.15) * 16;
          const wave2 = Math.cos((x / width) * Math.PI * 8 - i * 0.08) * 10;
          const wave3 = Math.sin((x / width) * Math.PI * 14 + i * 0.2) * 5;

          const y = baseY + wave1 + wave2 + wave3;

          if (s === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
      }

      // Secondary fine detail wave layer for richness
      ctx.strokeStyle = "#7c8e60";
      ctx.lineWidth = 0.55;
      ctx.globalAlpha = 0.25;

      const detailSpacing = 10;
      const detailRows = Math.ceil(height / detailSpacing) + 10;

      for (let i = 0; i < detailRows; i++) {
        const baseY = i * detailSpacing - 15;

        ctx.beginPath();
        const steps = 260;

        for (let s = 0; s <= steps; s++) {
          const x = (s / steps) * width;

          const wave1 = Math.cos((x / width) * Math.PI * 6 - i * 0.12) * 12;
          const wave2 = Math.sin((x / width) * Math.PI * 10 + i * 0.18) * 7;

          const y = baseY + wave1 + wave2;

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
      resizeTimer = setTimeout(renderPattern, 100);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-[#fcfdf4]">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
