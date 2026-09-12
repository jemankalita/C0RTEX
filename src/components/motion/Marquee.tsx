"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

type MarqueeProps = {
  children: React.ReactNode;
  /** Seconds per full loop. */
  speed?: number;
  reverse?: boolean;
  className?: string;
  innerClassName?: string;
};

function MarqueeRow({ children, speed = 28, reverse, innerClassName }: Omit<MarqueeProps, "className">) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={`flex shrink-0 items-center ${innerClassName ?? ""}`}>{children}</div>;
  }

  return (
    <motion.div
      className={`flex w-max shrink-0 items-center ${innerClassName ?? ""}`}
      animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
      transition={{ duration: speed, ease: "linear", repeat: Infinity }}
    >
      {children}
      {children}
    </motion.div>
  );
}

/**
 * Infinite horizontal marquee. Children are ONE copy of the content; the
 * component renders it 4× (two animated rows, each holding two copies) so the
 * loop is seamless on any viewport width: each row slides by exactly one copy
 * width (-50% of its own width) and snaps back invisibly.
 */
export function Marquee({ children, speed = 28, reverse, className, innerClassName }: MarqueeProps) {
  return (
    <div className={`flex overflow-hidden ${className ?? ""}`} aria-hidden="true">
      <MarqueeRow speed={speed} reverse={reverse} innerClassName={innerClassName}>
        {children}
      </MarqueeRow>
      <MarqueeRow speed={speed} reverse={reverse} innerClassName={innerClassName}>
        {children}
      </MarqueeRow>
    </div>
  );
}

type ParallaxProps = {
  children: React.ReactNode;
  /** Positive = moves slower (rises); negative = moves faster (sinks). Range around ±80 is subtle. */
  distance?: number;
  className?: string;
};

/**
 * Element whose vertical position is tied to scroll progress of its own
 * viewport traversal — the classic Raven-style depth effect.
 */
export function Parallax({ children, distance = 60, className }: ParallaxProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}
