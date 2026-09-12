"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

type SlideInProps = {
  children: React.ReactNode;
  className?: string;
  /** Slide direction on mount. */
  from?: "bottom" | "right" | "left";
  delay?: number;
  /** Key that restarts the animation when it changes (e.g. finding id). */
  animateKey?: string | number;
  /** When false, content is wrapped in AnimatePresence so it slides out too. */
  present?: boolean;
};

/**
 * Mount animation for conditionally-rendered UI (patch viewers, confirm
 * dialogs, recheck results). Slides in when it appears, and — when
 * `present` toggles — slides out via AnimatePresence.
 */
export function SlideIn({
  children,
  className,
  from = "bottom",
  delay = 0,
  animateKey,
  present,
}: SlideInProps) {
  const reduced = useReducedMotion();
  const offset =
    from === "bottom" ? { y: 36, x: 0 } : from === "right" ? { y: 0, x: 36 } : { y: 0, x: -36 };

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  const motionNode = (
    <motion.div
      key={animateKey !== undefined ? `${from}-${animateKey}` : undefined}
      className={className}
      initial={{ opacity: 0, ...offset }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.55, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );

  return present === undefined ? (
    motionNode
  ) : (
    <AnimatePresence initial={false}>
      {present ? motionNode : null}
    </AnimatePresence>
  );
}

/**
 * Thin scanning beam that sweeps across its container — the "analyst at
 * work" texture for the scanning state.
 */
export function ScanningBeam({ active }: { active: boolean }) {
  const reduced = useReducedMotion();

  if (!active || reduced) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl" aria-hidden="true">
      <motion.div
        className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-lime/12 to-transparent"
        initial={{ x: "-30%" }}
        animate={{ x: "480%" }}
        transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.35 }}
      />
    </div>
  );
}
