"use client";

import React from "react";

export function SkyMeshBG() {
  return (
    <div
      className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images/BG.png')" }}
    />
  );
}

export function SkyMeshCanvas() {
  return <SkyMeshBG />;
}
