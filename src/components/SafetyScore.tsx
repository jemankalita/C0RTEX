"use client";

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

export function SafetyScore({ score, grade }: SafetyScoreProps) {
  return (
    <article data-cursor="measure" className="rounded-3xl border border-line bg-surface p-6 sm:p-8">
      <p className="text-[11px] uppercase tracking-[0.22em] text-muted">Application safety</p>
      <p className="mt-3 text-6xl font-semibold tracking-tight">{score} / 100</p>
      <p className="mt-1 text-sm text-amber">GRADE {grade}</p>
      <ul className="mt-8 space-y-3">
        {BARS.map((bar) => (
          <li key={bar.label}>
            <div className="mb-1 flex justify-between text-xs text-muted">
              <span>{bar.label}</span>
              <span>{bar.value}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-elevated">
              <div className="h-full rounded-full bg-cyan" style={{ width: `${bar.value}%` }} />
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-xs leading-5 text-muted">
        A C0RTEX score is a risk-prioritization signal, not a security guarantee.
      </p>
    </article>
  );
}
