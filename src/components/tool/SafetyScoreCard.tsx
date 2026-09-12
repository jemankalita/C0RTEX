"use client";

import { useEffect, useState } from "react";
import type { CategoryScores } from "@/types/security";

type SafetyScoreCardProps = {
  score: number;
  grade: string;
  confidence: number;
  categories: CategoryScores;
};

export function SafetyScoreCard({ score, grade, confidence, categories }: SafetyScoreCardProps) {
  const [display, setDisplay] = useState(score);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) {
      setDisplay(score);
      return;
    }
    const start = display;
    const startTime = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / 1000, 1);
      setDisplay(Math.round(start + (score - start) * progress));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score]);

  return (
    <section className="panel rounded-2xl p-5">
      <p className="label">Safety score</p>
      <p className="mt-3 text-5xl font-semibold text-cyan">{display}</p>
      <p className="text-sm text-muted">/ 100 · Grade {grade}</p>
      <p className="mt-2 text-sm text-muted">Scan confidence {confidence}%</p>
      <p className="mt-3 text-sm text-muted">
        The score prioritizes findings using severity, reachability, confidence, and estimated
        impact.
      </p>
      <p className="mt-2 text-xs text-amber">
        This score is a prioritization signal, not a security guarantee.
      </p>
      <ul className="mt-4 space-y-1 text-sm">
        <li>Authorization: {categories.authorization}</li>
        <li>Input handling: {categories.inputHandling}</li>
        <li>Configuration: {categories.configuration}</li>
        <li>Secrets: {categories.secrets}</li>
        <li>Authentication: {categories.authentication}</li>
      </ul>
    </section>
  );
}
