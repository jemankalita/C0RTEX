"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CountUp } from "@/components/motion/CountUp";
import { DEMO_SCORE_BREAKDOWN } from "@/data/demoFindings";

type SafetyScoreProps = {
  score: number;
  grade: string;
};

const BARS = [
  { label: "Authorization", value: DEMO_SCORE_BREAKDOWN.authorization },
  { label: "Input handling", value: DEMO_SCORE_BREAKDOWN.inputHandling },
  { label: "Configuration", value: DEMO_SCORE_BREAKDOWN.configuration },
  { label: "Secrets", value: DEMO_SCORE_BREAKDOWN.secrets },
  { label: "Authentication", value: DEMO_SCORE_BREAKDOWN.authentication },
] as const;

const RECOMPUTE_MS = 2200;
const DRIFT = 5;

/** Small helper: oscillates around a base value so the card reads as live computation. */
function useDrift(base: number, active: boolean, seed: number) {
  const [value, setValue] = useState(base);

  useEffect(() => {
    if (!active) {
      setValue(base);
      return;
    }
    const interval = window.setInterval(() => {
      const offset = Math.round(
        Math.sin(Date.now() / RECOMPUTE_MS + seed * 1.7) * DRIFT +
          (Math.random() * 2 - 1),
      );
      setValue(Math.max(0, Math.min(100, base + offset)));
    }, RECOMPUTE_MS);
    return () => window.clearInterval(interval);
  }, [base, active, seed]);

  return value;
}

export function SafetyScore({ score, grade }: SafetyScoreProps) {
  const reduced = useReducedMotion();
  const live = !reduced;
  const drifted = useDrift(score, live, 0);

  return (
    <article data-cursor="measure" className="rounded-3xl border border-line bg-surface p-6 sm:p-8">
      <p className="text-[11px] uppercase tracking-[0.22em] text-muted">Application safety</p>
      <p className="mt-3 text-6xl font-semibold tracking-tight">
        <CountUp to={drifted} duration={1.1} /> / 100
      </p>
      <p className="mt-1 text-sm text-amber">GRADE {grade}</p>
      <ul className="mt-8 space-y-3">
        {BARS.map((bar, index) => (
          <BarRow
            key={bar.label}
            label={bar.label}
            base={bar.value}
            live={live}
            seed={index + 1}
            index={index}
          />
        ))}
      </ul>
      <p className="mt-6 text-xs leading-5 text-muted">
        A C0RTEX score is a risk-prioritization signal, not a security guarantee.
      </p>
    </article>
  );
}

function BarRow({
  label,
  base,
  live,
  seed,
  index,
}: {
  label: string;
  base: number;
  live: boolean;
  seed: number;
  index: number;
}) {
  const reduced = useReducedMotion();
  const value = useDrift(base, live, seed);

  return (
    <li>
      <div className="mb-1 flex justify-between text-xs text-muted">
        <span>{label}</span>
        <motion.span
          key={value}
          initial={reduced ? false : { opacity: 0.4 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="font-mono tabular-nums"
        >
          {value}
        </motion.span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-elevated">
        <motion.div
          className="h-full rounded-full bg-cyan"
          initial={reduced ? false : { width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.2, delay: live ? 0 : 0.15 + index * 0.08, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </li>
  );
}
