"use client";

import { useEffect, useState } from "react";

type RobotStatusProps = {
  status: string;
  compact?: boolean;
};

export function RobotStatus({ status, compact = false }: RobotStatusProps) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return (
    <div
      className={`panel relative overflow-hidden rounded-2xl ${compact ? "p-3" : "p-4"}`}
      aria-label={`Robot status ${status}`}
    >
      <div className="label mb-2">Analyst</div>
      <div className="flex items-center gap-3">
        <div
          className={`relative grid h-12 w-12 place-items-center rounded-full border border-cyan/40 bg-elevated ${
            reduceMotion ? "" : "animate-pulse"
          }`}
        >
          <span className="h-3 w-3 rounded-full bg-lime shadow-[0_0_12px_#B8FF4D]" />
        </div>
        <div>
          <p className="font-mono text-sm text-cyan">{status}</p>
          <p className="text-xs text-muted">Defensive investigator</p>
        </div>
      </div>
    </div>
  );
}
