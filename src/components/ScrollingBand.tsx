"use client";

import { Marquee } from "@/components/motion/Marquee";

const WORDS = [
  "recon",
  "attack surface",
  "reachable path",
  "exploit chain",
  "evidence",
  "verified fix",
  "recheck",
] as const;

function BandContent() {
  return (
    <>
      {WORDS.map((word, index) => (
        <span key={`${word}-${index}`} className="flex items-center gap-6 whitespace-nowrap px-6">
          <span
            className={`pixel-heading text-4xl sm:text-6xl ${
              index % 2 === 0 ? "text-white/90" : "text-white/25"
            }`}
          >
            {word}
          </span>
          <span className="text-3xl text-lime" aria-hidden="true">
            ✦
          </span>
        </span>
      ))}
    </>
  );
}

/**
 * Raven-style oversized scrolling keyword band — pure texture between
 * sections, screen-reader hidden (the words are decorative).
 */
export function ScrollingBand() {
  return (
    <section className="select-none overflow-hidden border-y border-line py-10" aria-hidden="true">
      <Marquee speed={40}>
        <div className="flex items-center">
          <BandContent />
          <BandContent />
        </div>
      </Marquee>
    </section>
  );
}
