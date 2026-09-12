"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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
  const [prevKey, setPrevKey] = useState(`${finding.id}:${finding.status}`);

  // Reset the selected node when the finding (or its status) changes —
  // adjusted during render per React's "derive state from props" pattern.
  const nextKey = `${finding.id}:${finding.status}`;
  if (nextKey !== prevKey) {
    setPrevKey(nextKey);
    setSelectedId(finding.attackPath[0]?.id ?? "");
  }

  const selected = finding.attackPath.find((node) => node.id === selectedId) ?? finding.attackPath[0];

  return (
    <section className="panel rounded-2xl p-5">
      <p className="label">Attack path</p>
      <ol className="mt-4 flex flex-col gap-2">
        {finding.attackPath.map((node, index) => (
          <motion.li
            key={`${finding.id}-${node.id}`}
            className="flex flex-col items-start"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              type="button"
              onClick={() => setSelectedId(node.id)}
              className={`w-full rounded-xl border px-3 py-3 text-left transition-colors duration-500 ${
                statusClass[node.status]
              } ${selectedId === node.id ? "pulse-ring" : ""}`}
            >
              <p className="font-mono text-[10px] tracking-widest">{typeLabel[node.type]}</p>
              <p className="text-sm">{node.label}</p>
            </button>
            {index < finding.attackPath.length - 1 ? (
              <motion.span
                className="px-3 py-1 text-muted"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.6, repeat: Infinity, delay: index * 0.25 }}
                aria-hidden
              >
                ↓
              </motion.span>
            ) : null}
          </motion.li>
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
