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
    <section className="panel rounded-2xl p-5">
      <p className="text-sm text-lime">Patch applied to temporary demo copy.</p>
      {finding.status !== "RESOLVED" ? (
        <button
          type="button"
          onClick={onRecheck}
          disabled={rechecking}
          className="mt-3 rounded-full bg-cyan px-4 py-2 text-sm font-semibold text-bg"
        >
          {rechecking ? "RECHECKING" : "Recheck finding"}
        </button>
      ) : (
        <div className="mt-3">
          <p className="font-mono text-sm text-lime">FINDING RESOLVED</p>
          <p className="mt-2 text-sm text-muted">
            The original source-to-sink path is no longer present in the patched demo code. One
            demonstrated risky path was resolved.
          </p>
          <p className="mt-2 font-mono text-sm">
            {initialScore} → {score}
          </p>
        </div>
      )}
    </section>
  );
}
