"use client";

import { motion, useReducedMotion } from "framer-motion";

type CircuitBoardProps = {
  className?: string;
  /** Trace color. */
  color?: string;
};

/**
 * Decorative circuit-board: traces draw themselves in and nodes blink
 * like signals travelling a motherboard.
 */
export function CircuitBoard({ className, color = "rgba(198,255,77,0.5)" }: CircuitBoardProps) {
  const reduced = useReducedMotion();

  const traces = [
    "M-20 90 H120 V150 H260 V120 H420",
    "M-20 210 H90 V260 H240 V200 H400 V240 H560",
    "M-20 320 H150 V280 H330 V330 H520",
    "M60 -20 V60 H180 V140",
    "M300 -20 V40 H460 V90",
    "M520 -20 V110 H620 V190",
  ];

  const nodes = [
    { x: 120, y: 150 },
    { x: 260, y: 120 },
    { x: 90, y: 260 },
    { x: 400, y: 240 },
    { x: 330, y: 280 },
    { x: 180, y: 140 },
    { x: 460, y: 90 },
    { x: 620, y: 190 },
  ];

  return (
    <svg
      className={className}
      viewBox="0 0 640 360"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {traces.map((d, index) => (
        <motion.path
          key={`trace-${index}`}
          d={d}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          initial={reduced ? false : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.55 }}
          transition={{ duration: 2.2, delay: 0.3 + index * 0.25, ease: "easeInOut" }}
        />
      ))}
      {nodes.map((node, index) => (
        <motion.circle
          key={`node-${index}`}
          cx={node.x}
          cy={node.y}
          r="4"
          fill={color}
          initial={reduced ? false : { opacity: 0, scale: 0 }}
          animate={{ opacity: [0.25, 1, 0.25], scale: 1 }}
          transition={{
            opacity: { duration: 2.4, repeat: Infinity, delay: index * 0.35, ease: "easeInOut" },
            scale: { duration: 0.5, delay: 0.3 + index * 0.2 },
          }}
        />
      ))}
    </svg>
  );
}
