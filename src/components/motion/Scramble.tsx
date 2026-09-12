"use client";

import { useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/\\[]{}=+#$%&";

type ScrambleTextProps = {
  text: string;
  className?: string;
  /** ms spent scrambling each character before it locks in */
  perChar?: number;
  /** overall cap for the whole decode, ms */
  duration?: number;
};

/**
 * Terminal-style decode: characters cycle random glyphs then lock in
 * left-to-right when the element scrolls into view.
 */
export function ScrambleText({ text, className, perChar = 34, duration = 1100 }: ScrambleTextProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const [display, setDisplay] = useState(() => (reduced ? text : text.replace(/[^\s]/g, " ")));

  useEffect(() => {
    if (!inView || reduced) return;
    let frame = 0;
    const totalFrames = Math.max(1, Math.floor(duration / 16));
    const lockFramePerChar = Math.max(1, Math.floor(totalFrames / Math.max(text.length, 1)));

    const interval = window.setInterval(() => {
      frame += 1;
      const lockedCount = Math.min(text.length, Math.floor(frame / lockFramePerChar) + 1);
      const next = text
        .split("")
        .map((char, index) => {
          if (char === " ") return " ";
          if (index < lockedCount) return text[index];
          return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        })
        .join("");
      setDisplay(next);
      if (lockedCount >= text.length) {
        setDisplay(text);
        window.clearInterval(interval);
      }
    }, 16);

    return () => window.clearInterval(interval);
  }, [inView, reduced, text, perChar, duration]);

  return (
    <span ref={ref} className={className} aria-label={text}>
      <span aria-hidden="true">{display}</span>
    </span>
  );
}
