"use client";

import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";

type CountUpProps = {
  to: number;
  from?: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
};

/**
 * Animated number that counts up the first time it scrolls into view.
 * Renders a MotionValue directly (no React state), so the digits update
 * without re-rendering the component tree.
 */
export function CountUp({ to, from = 0, duration = 1.6, suffix = "", prefix = "", className }: CountUpProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const value = useMotionValue(from);
  const rounded = useTransform(value, (latest) => Math.round(latest).toString());

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      value.set(to);
      return;
    }
    const controls = animate(value, to, { duration, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [inView, reduced, to, duration, value]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}
