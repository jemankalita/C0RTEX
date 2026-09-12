"use client";

import { useReducedMotion } from "framer-motion";

/**
 * Full-page film grain: a tiled SVG turbulence noise, doubled and
 * step-animated so it flickers like analog film. Purely decorative —
 * pointer-events none, screen-reader hidden, disabled for
 * prefers-reduced-motion.
 */
export function GrainOverlay() {
  const reduced = useReducedMotion();

  const noise = (
    <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
      <filter id="grain-noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain-noise)" />
    </svg>
  );

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[60] overflow-hidden opacity-[0.08] mix-blend-overlay"
      style={reduced ? undefined : { animation: "grain-shift 0.9s steps(6) infinite" }}
    >
      {noise}
      <style>{`
        @keyframes grain-shift {
          0% { transform: translate(0, 0); }
          20% { transform: translate(-2%, 1.5%); }
          40% { transform: translate(1.5%, -2%); }
          60% { transform: translate(-1%, 2%); }
          80% { transform: translate(2%, 1%); }
          100% { transform: translate(0, 0); }
        }
      `}</style>
    </div>
  );
}
