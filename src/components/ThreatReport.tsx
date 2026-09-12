"use client";

import { useState } from "react";
import { AttackPathGraph } from "@/components/AttackPathGraph";
import { getPrimaryFinding } from "@/data/demoFindings";
import {
  generatePatch,
  INITIAL_DEMO_STATE,
  recheckFinding,
  revealEvidence,
  viewAttackPath,
  type DemoReportState,
} from "@/lib/demoState";

export function ThreatReport() {
  const [state, setState] = useState<DemoReportState>(INITIAL_DEMO_STATE);
  const finding = getPrimaryFinding();

  return (
    <section id="threat-reports" className="mx-auto max-w-6xl px-5 py-24">
      <p className="text-[11px] uppercase tracking-[0.28em] text-threat">Actionable security reports</p>
      <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight sm:text-5xl">
        A report developers can act on.
      </h2>

      <article className="mt-10 rounded-3xl border border-line bg-surface p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-threat">
          {state.resolved ? "Resolved · broken access control" : "High · broken access control"}
        </p>
        <h3 className="mt-3 text-2xl font-semibold">Missing ownership check in order endpoint</h3>
        <p className="mt-4 font-mono text-sm text-cyan">Location: {finding.location}</p>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
          Attacker story: {finding.story}
        </p>

        {state.showEvidence ? (
          <ul className="mt-5 list-disc space-y-2 pl-5 text-sm text-muted">
            {finding.evidence.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}

        <p className="mt-5 text-sm text-ink">Suggested fix: {finding.suggestedFix}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-full border border-line px-4 py-2 text-sm"
            aria-expanded={state.showEvidence}
            onClick={() => setState((current) => revealEvidence(current))}
          >
            View evidence
          </button>
          <button
            type="button"
            className="rounded-full border border-line px-4 py-2 text-sm"
            onClick={() => setState((current) => viewAttackPath(current))}
          >
            Show attack path
          </button>
          <button
            type="button"
            className="rounded-full border border-line px-4 py-2 text-sm"
            onClick={() => setState((current) => generatePatch(current))}
          >
            Generate patch
          </button>
          <button
            type="button"
            className="rounded-full bg-lime px-4 py-2 text-sm text-bg"
            onClick={() => setState((current) => recheckFinding(current))}
          >
            Recheck
          </button>
        </div>

        {state.showPatch ? (
          <pre data-cursor="inspect" className="mt-6 overflow-x-auto rounded-2xl bg-bg p-4 font-mono text-xs leading-6">
            <span className="text-threat">- {finding.patchBefore}</span>
            {"\n"}
            <span className="text-lime">+ {finding.patchAfter}</span>
          </pre>
        ) : null}

        {state.showAttackPath ? (
          <div className="mt-6">
            <AttackPathGraph resolved={state.resolved} highlighted />
          </div>
        ) : null}
      </article>
    </section>
  );
}
