"use client";

import { useEffect, useState } from "react";
import type { AttackPathNode, SecurityFinding } from "@/types/security";

const typeLabel: Record<AttackPathNode["type"], string> = {
  entry: "PUBLIC ROUTE",
  input: "USER INPUT",
  handler: "CONTROLLER",
  sink: "DATABASE SINK",
  "missing-control": "MISSING CHECK",
  impact: "DATA ACCESS",
};

const statusClass: Record<AttackPathNode["status"], string> = {
  discovered: "border-cyan text-cyan",
  suspicious: "border-amber text-amber",
  risky: "border-threat text-threat",
  fixed: "border-lime text-lime",
};

export function AttackPath({ finding }: { finding: SecurityFinding }) {
  const [selectedId, setSelectedId] = useState(finding.attackPath[0]?.id ?? "");

  useEffect(() => {
    setSelectedId(finding.attackPath[0]?.id ?? "");
  }, [finding.id, finding.status]);

  const selected = finding.attackPath.find((node) => node.id === selectedId) ?? finding.attackPath[0];

  return (
    <section className="panel rounded-2xl p-5">
      <p className="label">Attack path</p>
      <ol className="mt-4 flex flex-col gap-2">
        {finding.attackPath.map((node, index) => (
          <li key={`${finding.id}-${node.id}`} className="flex flex-col items-start">
            <button
              type="button"
              onClick={() => setSelectedId(node.id)}
              className={`w-full rounded-xl border px-3 py-3 text-left transition-colors duration-500 ${statusClass[node.status]}`}
            >
              <p className="font-mono text-[10px] tracking-widest">{typeLabel[node.type]}</p>
              <p className="text-sm">{node.label}</p>
            </button>
            {index < finding.attackPath.length - 1 ? (
              <span className="px-3 py-1 text-muted" aria-hidden>
                ↓
              </span>
            ) : null}
          </li>
        ))}
      </ol>
      {selected ? (
        <div className="mt-4 rounded-xl border border-white/10 bg-bg/50 p-3 text-sm">
          <p className="font-mono text-xs text-cyan">
            {selected.file ?? "Context"}
            {selected.line ? `:${selected.line}` : ""}
          </p>
          <p className="mt-1 text-muted">Role: {typeLabel[selected.type]}</p>
          <p className="mt-1">{selected.description ?? selected.label}</p>
        </div>
      ) : null}
    </section>
  );
}
