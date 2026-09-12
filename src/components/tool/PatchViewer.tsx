"use client";

import { useState } from "react";
import type { SecurityFinding } from "@/types/security";

type PatchViewerProps = {
  finding: SecurityFinding;
  visible: boolean;
  generating: boolean;
  confirming: boolean;
  onGenerate: () => void;
  onConfirmToggle: (value: boolean) => void;
  onApply: () => void;
  onReject: () => void;
};

export function PatchViewer({
  finding,
  visible,
  generating,
  confirming,
  onGenerate,
  onConfirmToggle,
  onApply,
  onReject,
}: PatchViewerProps) {
  const [copied, setCopied] = useState(false);

  return (
    <section className="panel rounded-2xl p-5">
      <p className="label">Suggested fix</p>
      {!visible ? (
        <button
          type="button"
          onClick={onGenerate}
          disabled={generating || finding.status === "RESOLVED"}
          className="mt-3 rounded-full bg-cyan px-4 py-2 text-sm font-semibold text-bg disabled:opacity-40"
        >
          {generating ? "REASONING ABOUT MINIMAL FIX" : "Generate suggested fix"}
        </button>
      ) : (
        <>
          <pre className="mt-3 overflow-x-auto rounded-xl bg-bg p-4 font-mono text-xs leading-6">
            <code>{finding.patch}</code>
          </pre>
          <p className="mt-3 text-sm text-muted">{finding.patchExplanation}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={async () => {
                if (finding.patch && navigator.clipboard) {
                  await navigator.clipboard.writeText(finding.patch);
                }
                setCopied(true);
              }}
              className="rounded-full border border-white/15 px-3 py-2 text-sm"
            >
              {copied ? "Patch copied" : "Copy patch"}
            </button>
            <button
              type="button"
              onClick={() => onConfirmToggle(true)}
              disabled={finding.status !== "OPEN" && finding.status !== "UNDER_REVIEW"}
              className="rounded-full bg-lime px-3 py-2 text-sm font-semibold text-bg disabled:opacity-40"
            >
              Apply to demo copy
            </button>
            <button
              type="button"
              onClick={onReject}
              className="rounded-full border border-white/15 px-3 py-2 text-sm"
            >
              Reject suggestion
            </button>
          </div>
        </>
      )}

      {confirming ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="patch-confirm-title"
          className="mt-4 rounded-xl border border-amber/40 bg-elevated p-4"
        >
          <h3 id="patch-confirm-title" className="font-semibold">
            Apply this patch to the temporary demo repository?
          </h3>
          <p className="mt-2 text-sm text-muted">This will not modify an external repository.</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => onConfirmToggle(false)}
              className="rounded-full border border-white/15 px-3 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onApply}
              className="rounded-full bg-lime px-3 py-2 text-sm font-semibold text-bg"
            >
              Apply patch
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
