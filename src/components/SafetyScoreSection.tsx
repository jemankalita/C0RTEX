"use client";

import { useState } from "react";
import { SafetyScore } from "@/components/SafetyScore";
import { DEMO_GRADE_AFTER, DEMO_GRADE_BEFORE, DEMO_SCORE_AFTER, DEMO_SCORE_BEFORE } from "@/data/demoFindings";

export function SafetyScoreSection() {
  const [patched, setPatched] = useState(false);

  return (
    <section className="mx-auto max-w-6xl px-5 py-24">
      <p className="text-[11px] uppercase tracking-[0.28em] text-amber">Measure what matters</p>
      <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight sm:text-5xl">
        A score that explains itself.
      </h2>
      <p className="mt-5 max-w-2xl text-base leading-7 text-muted">
        C0RTEX calculates a prioritization score using severity, reachability,
        exploitability indicators, and confidence. It is not a certification and
        does not guarantee that an application is secure.
      </p>
      <div className="mt-8 max-w-xl">
        <SafetyScore
          score={patched ? DEMO_SCORE_AFTER : DEMO_SCORE_BEFORE}
          grade={patched ? DEMO_GRADE_AFTER : DEMO_GRADE_BEFORE}
        />
        <button
          type="button"
          className="mt-4 rounded-full border border-line px-4 py-2 text-sm"
          onClick={() => setPatched((value) => !value)}
        >
          {patched ? "Show before patch" : "Preview after patch"}
        </button>
        <p className="mt-3 text-sm text-muted">
          Animated transition: {DEMO_SCORE_BEFORE} → {DEMO_SCORE_AFTER}
        </p>
      </div>
    </section>
  );
}
