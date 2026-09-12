"use client";

import { StaggerGroup, StaggerItem } from "@/components/motion/Reveal";
import type { SecurityFinding } from "@/types/security";

const severityColor: Record<string, string> = {
  HIGH: "text-threat",
  CRITICAL: "text-threat",
  MEDIUM: "text-amber",
  LOW: "text-cyan",
  NEEDS_REVIEW: "text-amber",
};

type FindingsListProps = {
  findings: SecurityFinding[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export function FindingsList({ findings, selectedId, onSelect }: FindingsListProps) {
  return (
    <section className="panel rounded-2xl p-4">
      <p className="label">Findings</p>
      <StaggerGroup as="ul" className="mt-3 space-y-2" childAs="li" stagger={0.07}>
        {findings.map((finding) => (
          <StaggerItem key={finding.id} as="li">
            <button
              type="button"
              onClick={() => onSelect(finding.id)}
              aria-selected={selectedId === finding.id}
              className={`w-full rounded-xl border px-3 py-3 text-left ${
                selectedId === finding.id ? "border-cyan bg-elevated" : "border-white/10"
              }`}
            >
              <p className={`font-mono text-xs ${severityColor[finding.severity]}`}>
                {finding.severity} · {finding.status.replace("_", " ")}
              </p>
              <p className="mt-1 text-sm font-medium">{finding.title}</p>
              <p className="font-mono text-xs text-muted">{finding.locationLabel}</p>
              <p className="text-xs text-muted">{finding.category}</p>
              <p className="text-xs text-muted">Confidence {finding.confidence}%</p>
            </button>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
