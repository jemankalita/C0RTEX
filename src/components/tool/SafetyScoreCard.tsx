"use client";

import { useEffect } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import type { CategoryScores } from "@/types/security";

type SafetyScoreCardProps = {
  score: number;
  grade: string;
  confidence: number;
  categories: CategoryScores;
  /** When false the score is not yet real — show a waiting state instead. */
  ready?: boolean;
};

const CATEGORY_LABELS: Array<{ key: keyof CategoryScores; label: string }> = [
  { key: "authorization", label: "Authorization" },
  { key: "inputHandling", label: "Input handling" },
  { key: "configuration", label: "Configuration" },
  { key: "secrets", label: "Secrets" },
  { key: "authentication", label: "Authentication" },
];

export function SafetyScoreCard({
  score,
  grade,
  confidence,
  categories,
  ready = true,
}: SafetyScoreCardProps) {
  const reduced = useReducedMotion();
  const count = useMotionValue(reduced ? score : 0);
  const display = useTransform(count, (value) => Math.round(value).toString());

  useEffect(() => {
    if (!ready || reduced) {
      count.set(ready ? score : 0);
      return;
    }
    count.set(0);
    const controls = animate(count, score, { duration: 1.4, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [count, score, ready, reduced]);

  return (
    <section className="panel hud-panel rounded-2xl p-5">
      <p className="label">Safety score</p>
      {ready ? (
        <>
          <p className="pixel-heading mt-3 text-5xl text-cyan">
            <motion.span>{display}</motion.span>
          </p>
          <p className="text-sm text-muted">/ 100 · Grade {grade}</p>
          <p className="mt-2 text-sm text-muted">Scan confidence {confidence}%</p>
        </>
      ) : (
        <>
          <p className="pixel-heading mt-3 text-3xl text-white/45">WAITING FOR SCAN</p>
          <p className="mt-2 text-sm text-muted" aria-live="polite">
            Score appears here once the threat scan completes.
          </p>
        </>
      )}
      <p className="mt-3 text-sm text-muted">
        The score prioritizes findings using severity, reachability, confidence, and estimated
        impact.
      </p>
      <p className="mt-2 text-xs text-amber">
        This score is a prioritization signal, not a security guarantee.
      </p>
      <ul className="mt-4 space-y-2 text-sm" aria-hidden={!ready}>
        {CATEGORY_LABELS.map(({ key, label }, index) => (
          <li key={key}>
            <div className="mb-1 flex justify-between text-xs text-muted">
              <span>{label}</span>
              <span>{categories[key]}</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-elevated">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-cyan to-lime"
                initial={reduced || !ready ? false : { width: 0 }}
                animate={{ width: ready ? `${categories[key]}%` : "0%" }}
                transition={{ duration: 1, delay: 0.1 + index * 0.08, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
