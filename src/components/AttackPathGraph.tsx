"use client";

import { useState } from "react";
import { useReducedMotion } from "framer-motion";

export type AttackNode = {
  id: string;
  label: string;
  detail: string;
  location: string;
  tone: "cyan" | "amber" | "threat" | "lime";
};

const NODES: AttackNode[] = [
  {
    id: "route",
    label: "Public route",
    detail: "GET /api/orders/:id",
    location: "src/routes/orders.ts:12",
    tone: "cyan",
  },
  {
    id: "input",
    label: "User-controlled input",
    detail: "req.params.id",
    location: "src/routes/orders.ts:16",
    tone: "cyan",
  },
  {
    id: "check",
    label: "Missing security check",
    detail: "Ownership verification absent",
    location: "src/routes/orders.ts:18",
    tone: "amber",
  },
  {
    id: "operation",
    label: "Sensitive operation",
    detail: "Order.findById(id)",
    location: "src/models/order.ts:41",
    tone: "threat",
  },
  {
    id: "impact",
    label: "Potential impact",
    detail: "Unauthorized order data access",
    location: "Response payload",
    tone: "threat",
  },
];

const TONE_CLASS = {
  cyan: "border-cyan/40 text-cyan",
  amber: "border-amber/40 text-amber",
  threat: "border-threat/40 text-threat",
  lime: "border-lime/40 text-lime",
};

type AttackPathGraphProps = {
  resolved?: boolean;
  highlighted?: boolean;
};

export function AttackPathGraph({ resolved = false, highlighted = false }: AttackPathGraphProps) {
  const [activeId, setActiveId] = useState<string>(NODES[0].id);
  const reduced = useReducedMotion();
  const active = NODES.find((node) => node.id === activeId) ?? NODES[0];

  return (
    <div className={`grid gap-6 lg:grid-cols-[1.2fr_0.8fr] ${highlighted ? "ring-1 ring-lime/30" : ""}`}>
      <ol className="flex flex-col gap-3 lg:flex-row lg:items-stretch" data-cursor="trace">
        {NODES.map((node, index) => {
          const tone = resolved ? "lime" : node.tone;
          return (
            <li key={node.id} className="flex flex-1 flex-col">
              <button
                type="button"
                onMouseEnter={() => setActiveId(node.id)}
                onFocus={() => setActiveId(node.id)}
                onClick={() => setActiveId(node.id)}
                className={`w-full rounded-2xl border bg-surface px-3 py-4 text-left text-xs uppercase tracking-[0.16em] ${TONE_CLASS[tone]} ${
                  activeId === node.id && !reduced ? "pulse-ring" : ""
                }`}
              >
                {node.label}
              </button>
              {index < NODES.length - 1 ? (
                <span className="mx-auto my-1 hidden h-full w-px bg-line lg:hidden" aria-hidden="true">
                  ↓
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
      <aside className="rounded-2xl border border-line bg-elevated p-5">
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted">Attack path</p>
        <p className="mt-3 text-sm font-medium text-ink">{resolved ? "Path broken after recheck" : active.detail}</p>
        <dl className="mt-4 space-y-2 text-sm text-muted">
          <div>
            <dt className="text-[11px] uppercase tracking-[0.16em]">Entry</dt>
            <dd className="font-mono text-cyan">GET /api/orders/:id</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-[0.16em]">Input</dt>
            <dd className="font-mono">req.params.id</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-[0.16em]">Missing control</dt>
            <dd>Ownership verification</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-[0.16em]">Impact</dt>
            <dd>Unauthorized access to order data</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-[0.16em]">Confidence</dt>
            <dd>93%</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-[0.16em]">Code location</dt>
            <dd className="font-mono text-ink">{active.location}</dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}
