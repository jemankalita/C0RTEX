"use client";

import { useEffect, useRef } from "react";

type SiteBackgroundProps = {
  dim?: "light" | "medium";
};

export function SiteBackground({ dim = "medium" }: SiteBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const keepPlaying = () => {
      if (video.paused) {
        void video.play().catch(() => undefined);
      }
    };

    keepPlaying();
    video.addEventListener("pause", keepPlaying);
    video.addEventListener("ended", keepPlaying);
    video.addEventListener("stalled", keepPlaying);
    document.addEventListener("visibilitychange", keepPlaying);
    return () => {
      video.removeEventListener("pause", keepPlaying);
      video.removeEventListener("ended", keepPlaying);
      video.removeEventListener("stalled", keepPlaying);
      document.removeEventListener("visibilitychange", keepPlaying);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-black" aria-hidden="true">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full scale-105 object-cover opacity-60 brightness-110 contrast-105"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src="/c0rtex-bg.mp4" type="video/mp4" />
      </video>
      <div
        className={`absolute inset-0 ${
          dim === "light"
            ? "bg-[linear-gradient(180deg,rgba(7,7,8,0.12)_0%,rgba(7,7,8,0.28)_58%,rgba(7,7,8,0.48)_100%)]"
            : "bg-[linear-gradient(180deg,rgba(7,7,8,0.28)_0%,rgba(7,7,8,0.42)_50%,rgba(7,7,8,0.62)_100%)]"
        }`}
      />
    </div>
  );
}
