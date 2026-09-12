import type { ScanSummary } from "@/types/security";

type ScanSummaryProps = {
  repositoryName: string;
  summary: ScanSummary;
  onStartOver: () => void;
};

export function ScanSummaryCard({ repositoryName, summary, onStartOver }: ScanSummaryProps) {
  return (
    <section className="panel rounded-2xl p-5">
      <p className="label">C0RTEX security report</p>
      <h2 className="mt-2 text-xl font-semibold">{repositoryName}</h2>
      <p className="text-sm text-lime">Scan status: Complete</p>
      <p className="mt-3 text-sm">
        Findings: {summary.high} High · {summary.medium} Medium · {summary.low} Low
      </p>
      <p className="mt-2 text-sm text-muted">
        Review the high-severity authorization and injection findings first.
      </p>
      <button
        type="button"
        onClick={onStartOver}
        className="mt-4 rounded-full border border-white/15 px-4 py-2 text-sm"
      >
        Start over
      </button>
    </section>
  );
}
