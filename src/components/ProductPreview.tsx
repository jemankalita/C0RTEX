"use client";

import { useMemo, useState } from "react";
import { AttackPathGraph } from "@/components/AttackPathGraph";
import { SafetyScore } from "@/components/SafetyScore";
import {
  countBySeverity,
  DEMO_ATTACK_SURFACE,
  DEMO_GRADE_AFTER,
  DEMO_GRADE_BEFORE,
  DEMO_REPO,
  getPrimaryFinding,
} from "@/data/demoFindings";
import {
  expandFinding,
  generatePatch,
  INITIAL_DEMO_STATE,
  recheckFinding,
  viewAttackPath,
  visibleFindings,
  type DemoReportState,
} from "@/lib/demoState";

const TABS = [
  { id: "findings", label: "Findings" },
  { id: "path", label: "Attack path" },
  { id: "score", label: "Score" },
  { id: "patch", label: "Suggested patch" },
] as const;

export function ProductPreview() {
  const [state, setState] = useState<DemoReportState>(INITIAL_DEMO_STATE);
  const findings = visibleFindings(state.resolved);
  const counts = useMemo(() => countBySeverity(findings), [findings]);
  const primary = getPrimaryFinding();

  return (
    <section id="demo" className="mx-auto max-w-6xl px-5 py-24">
      <p className="text-[11px] uppercase tracking-[0.28em] text-cyan">The C0RTEX view</p>
      <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl">
        See what the scanner cannot explain.
      </h2>
      <p className="mt-4 text-sm text-amber">Demo report — sample data, not a live scan.</p>

      <div className="mt-8 overflow-hidden rounded-3xl border border-line bg-surface">
        <header className="flex flex-col gap-4 border-b border-line px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted">C0RTEX security report</p>
            <p className="mt-1 text-sm text-ink">Repository: {DEMO_REPO}</p>
          </div>
          <p className="text-sm text-muted">
            Safety score: {state.score} / 100 · {counts.high} High · {counts.medium} Medium · {counts.low} Low
          </p>
        </header>

        <div className="grid gap-4 border-b border-line px-5 py-4 text-xs text-muted sm:grid-cols-3">
          <p>Attack surface: {DEMO_ATTACK_SURFACE.publicRoutes} public routes</p>
          <p>{DEMO_ATTACK_SURFACE.databaseSinks} database sinks</p>
          <p>{DEMO_ATTACK_SURFACE.sensitiveOperations} sensitive operations</p>
        </div>

        <div className="flex flex-wrap gap-2 px-5 pt-5" role="tablist" aria-label="Demo report tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={state.activeTab === tab.id}
              className={`rounded-full px-4 py-2 text-sm ${
                state.activeTab === tab.id ? "bg-lime text-bg" : "border border-line text-muted"
              }`}
              onClick={() => setState((current) => ({ ...current, activeTab: tab.id }))}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {state.activeTab === "findings" ? (
            <ul className="space-y-3">
              {findings.slice(0, 4).map((finding) => {
                const expanded = state.expandedFindingId === finding.id;
                return (
                  <li key={finding.id} className="rounded-2xl border border-line bg-elevated">
                    <button
                      type="button"
                      aria-expanded={expanded}
                      className="flex w-full items-start justify-between gap-4 px-4 py-4 text-left"
                      onClick={() => setState((current) => expandFinding(current, finding.id))}
                    >
                      <span>
                        <span className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${
                          finding.severity === "HIGH" ? "text-threat" : "text-amber"
                        }`}>
                          {state.resolved && finding.id === primary.id ? "Resolved" : finding.severity}
                        </span>
                        <span className="mt-1 block text-sm text-ink">{finding.title}</span>
                        <span className="mt-1 block font-mono text-xs text-cyan">
                          {finding.route ?? finding.location}
                        </span>
                      </span>
                    </button>
                    {expanded ? (
                      <div className="space-y-3 border-t border-line px-4 py-4 text-sm text-muted">
                        <p>{finding.story}</p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="rounded-full border border-line px-3 py-1 text-xs text-ink"
                            onClick={() => setState((current) => viewAttackPath(current))}
                          >
                            View attack path
                          </button>
                          <button
                            type="button"
                            className="rounded-full border border-line px-3 py-1 text-xs text-ink"
                            onClick={() => setState((current) => generatePatch(current))}
                          >
                            Generate patch
                          </button>
                          <button
                            type="button"
                            className="rounded-full bg-lime px-3 py-1 text-xs text-bg"
                            onClick={() => setState((current) => recheckFinding(current))}
                          >
                            Recheck
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ) : null}

          {state.activeTab === "path" ? <AttackPathGraph resolved={state.resolved} highlighted /> : null}

          {state.activeTab === "score" ? (
            <SafetyScore
              score={state.score}
              grade={state.resolved || state.patched ? DEMO_GRADE_AFTER : DEMO_GRADE_BEFORE}
            />
          ) : null}

          {state.activeTab === "patch" ? (
            <pre data-cursor="inspect" className="overflow-x-auto rounded-2xl bg-bg p-4 font-mono text-xs leading-6">
              <span className="text-threat">- {primary.patchBefore}</span>
              {"\n"}
              <span className="text-lime">+ {primary.patchAfter}</span>
            </pre>
          ) : null}
        </div>
      </div>
    </section>
  );
}
