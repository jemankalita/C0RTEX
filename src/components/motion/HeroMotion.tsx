"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Hero scroll choreography, Raven-style:
 *  - the whole hero content drifts up and fades as you scroll away (parallax exit)
 *  - headline words slide up with a staggered entrance on first load
 */
export function HeroScrollFade({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  if (reduced) {
    return <div ref={ref} className={className}>{children}</div>;
  }

  return (
    <motion.div ref={ref} style={{ y, opacity }} className={className}>
      {children}
    </motion.div>
  );
}

/** Staggered word-by-word slide-up for the hero headline. */
export function HeroHeadline({
  text,
  className,
  accent = false,
}: {
  text: string;
  className?: string;
  /** Append a pulsing pixel asterisk after the last word. */
  accent?: boolean;
}) {
  const reduced = useReducedMotion();
  const words = text.split(" ");
  const accentNode = accent ? <span className="pixel-asterisk" aria-hidden="true">*</span> : null;

  if (reduced) {
    return (
      <h1 className={className}>
        {text}
        {accentNode}
      </h1>
    );
  }

  return (
    <h1 className={className} aria-label={text}>
      {words.map((word, index) => (
        <span key={`${word}-${index}`} className="inline-block overflow-hidden pb-[0.08em] align-bottom" aria-hidden="true">
          <motion.span
            className="inline-block"
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.9, delay: 0.15 + index * 0.07, ease: EASE }}
          >
            {word}
            {index < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
      {accentNode}
    </h1>
  );
}
