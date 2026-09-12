"use client";

import { useState } from "react";
import { SlideIn } from "@/components/motion/SlideIn";
import type { SecurityFinding, SourceKind } from "@/types/security";

type PatchViewerProps = {
  finding: SecurityFinding;
  source: SourceKind;
  visible: boolean;
  generating: boolean;
  confirming: boolean;
  canDownload: boolean;
  onGenerate: () => void;
  onConfirmToggle: (value: boolean) => void;
  onApply: () => void;
  onReject: () => void;
  onDownload: () => void;
  onDownloadAll: () => void;
};

export function PatchViewer({
  finding,
  source,
  visible,
  generating,
  confirming,
  canDownload,
  onGenerate,
  onConfirmToggle,
  onApply,
  onReject,
  onDownload,
  onDownloadAll,
}: PatchViewerProps) {
  const [copied, setCopied] = useState(false);
  const remote = source === "github";

  return (
    <section className="panel p-5">
      <p className="text-sm font-semibold text-bone">Suggested fix</p>
      <p className="mt-2 text-sm text-muted">
        Generate a reviewable patch, apply it to this scan&apos;s working copy, then download the
        changed file and commit it in the real repository. C0RTEX does not push to GitHub.
      </p>
      {!visible ? (
        <button
          type="button"
          onClick={onGenerate}
          disabled={generating || finding.status === "RESOLVED"}
          className="btn-primary mt-3 disabled:opacity-40"
        >
          {generating ? "REASONING ABOUT MINIMAL FIX" : "Generate suggested fix"}
        </button>
      ) : (
        <SlideIn from="bottom" present animateKey={`patch-${finding.id}-${finding.status}`}>
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
              Apply to working copy
            </button>
            <button
              type="button"
              onClick={onReject}
              className="rounded-full border border-white/15 px-3 py-2 text-sm"
            >
              Reject suggestion
            </button>
            {canDownload ? (
              <>
                <button
                  type="button"
                  onClick={onDownload}
                  className="rounded-full border border-cyan/40 px-3 py-2 text-sm"
                >
                  Download patched file
                </button>
                <button
                  type="button"
                  onClick={onDownloadAll}
                  className="rounded-full border border-white/15 px-3 py-2 text-sm"
                >
                  Download all applied fixes
                </button>
              </>
            ) : null}
          </div>
        </SlideIn>
      )}

      <SlideIn from="bottom" present={confirming} animateKey={`confirm-${finding.id}`}>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="patch-confirm-title"
          className="mt-4 rounded-xl border border-amber/40 bg-elevated p-4"
        >
          <h3 id="patch-confirm-title" className="font-semibold">
            Apply this patch to the scan working copy?
          </h3>
          <p className="mt-2 text-sm text-muted">
            {remote
              ? "This updates the copied files from the scan so C0RTEX can recheck the path. It will not commit or open a pull request on GitHub."
              : "This updates the temporary demo copy so the finding can be rechecked. It will not change files on disk unless you download them."}
          </p>
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
              className="rounded-full bg-lime px-3 py-2 text-sm font-semibold text-bg transition-shadow duration-300 hover:shadow-[0_0_20px_rgba(198,255,77,0.45)]"
            >
              Apply patch
            </button>
          </div>
        </div>
      </SlideIn>
    </section>
  );
}
