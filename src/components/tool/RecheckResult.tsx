"use client";

import { SlideIn } from "@/components/motion/SlideIn";
import type { SecurityFinding } from "@/types/security";

type RecheckResultProps = {
  finding: SecurityFinding;
  score: number;
  initialScore: number;
  onRecheck: () => void;
  rechecking: boolean;
};

export function RecheckResult({
  finding,
  score,
  initialScore,
  onRecheck,
  rechecking,
}: RecheckResultProps) {
  if (finding.status === "OPEN" || finding.status === "UNDER_REVIEW") {
    return null;
  }

  return (
    <SlideIn from="bottom" present animateKey={`recheck-${finding.id}-${finding.status}`}>
      <section className="panel p-5">
        <p className="text-sm text-confirmed">Patch applied to the scan working copy.</p>
        <p className="mt-2 text-sm text-muted">
          Recheck verifies this path in the working copy. Download the patched file and commit it to
          actually fix the repository.
        </p>
        {finding.status !== "RESOLVED" ? (
          <button
            type="button"
            onClick={onRecheck}
            disabled={rechecking}
            className="mt-3 rounded-full bg-cyan px-4 py-2 text-sm font-semibold text-bg transition-shadow duration-300 hover:shadow-[0_0_20px_rgba(215,255,107,0.35)] disabled:opacity-40"
          >
            {rechecking ? (
              <span className="scan-stage-current">RECHECKING</span>
            ) : (
              "Recheck finding"
            )}
          </button>
        ) : (
          <div className="mt-3">
            <p className="font-mono text-sm text-lime">FINDING RESOLVED</p>
            <p className="mt-2 text-sm text-muted">
              The original source-to-sink path is no longer present in the patched demo code. One
              demonstrated risky path was resolved.
            </p>
            <p className="mt-2 font-mono text-sm">
              <span className="text-muted">{initialScore}</span>
              <span className="mx-2 text-muted">→</span>
              <span className="text-lime">{score}</span>
            </p>
          </div>
        )}
      </section>
    </SlideIn>
  );
}
