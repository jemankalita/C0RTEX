import { SCAN_TIMELINE_LABELS, stageIndex } from "@/lib/scanStages";
import type { ScanStatus } from "@/types/security";

type ScanProgressProps = {
  status: ScanStatus;
  explanation: string;
};

const STATUS_COPY: Record<string, string> = {
  preparing: "PREPARING REPOSITORY",
  mapping: "MAPPING APPLICATION SURFACE",
  tracing: "TRACING INPUTS AND ROUTES",
  reasoning: "REASONING ABOUT REACHABILITY",
  scoring: "CALCULATING SEVERITY AND SCORE",
  report_ready: "THREAT REPORT READY",
  patch_ready: "PATCH READY FOR REVIEW",
  rechecking: "RECHECKING",
  resolved: "FINDING RESOLVED",
};

export function ScanProgress({ status, explanation }: ScanProgressProps) {
  const completeThrough =
    status === "idle" || status === "error"
      ? -1
      : status === "report_ready" ||
          status === "patch_ready" ||
          status === "rechecking" ||
          status === "resolved"
        ? SCAN_TIMELINE_LABELS.length
        : stageIndex(status);

  return (
    <section className="panel rounded-2xl p-5">
      <p className="label text-cyan">Scan progress</p>
      <p className="mt-2 font-mono text-sm text-cyan" aria-live="polite">
        {STATUS_COPY[status] ?? "IDLE"}
      </p>
      <p className="mt-1 text-sm text-muted">{explanation}</p>
      <ol className="mt-4 space-y-2">
        {SCAN_TIMELINE_LABELS.map((label, index) => {
          const complete = completeThrough > index;
          const current = stageIndex(status) === index && !complete;
          return (
            <li key={label} className="flex items-center gap-3 text-sm">
              <span
                className={`grid h-5 w-5 place-items-center rounded-full border text-[10px] ${
                  complete ? "border-lime bg-lime/15 text-lime" : current ? "border-cyan text-cyan" : "border-white/15 text-muted"
                }`}
              >
                {complete ? "✓" : index + 1}
              </span>
              <span className={complete ? "text-ink" : "text-muted"}>{label}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
