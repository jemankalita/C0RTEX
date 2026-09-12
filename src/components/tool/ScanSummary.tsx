import { CountUp } from "@/components/motion/CountUp";
import { Reveal } from "@/components/motion/Reveal";
import type { ScanSummary } from "@/types/security";

type ScanSummaryProps = {
  repositoryName: string;
  summary: ScanSummary;
  onStartOver: () => void;
};

export function ScanSummaryCard({ repositoryName, summary, onStartOver }: ScanSummaryProps) {
  return (
    <section className="panel hud-panel rounded-2xl p-5">
      <p className="label">C0RTEX security report</p>
      <h2 className="pixel-heading mt-2 text-xl text-white/90">{repositoryName}</h2>
      <p className="text-sm text-lime">Scan status: Complete</p>
      <Reveal delay={0.1}>
        <p className="mt-3 text-sm">
          Findings:{" "}
          <span className="font-semibold text-threat">
            <CountUp to={summary.high} duration={1.1} /> High
          </span>{" "}
          · <span className="text-amber">{summary.medium} Medium</span> ·{" "}
          <span className="text-cyan">{summary.low} Low</span>
        </p>
      </Reveal>
      <p className="mt-2 text-sm text-muted">
        Review the high-severity authorization and injection findings first.
      </p>
      <button
        type="button"
        onClick={onStartOver}
        className="mt-4 rounded-full border border-white/15 px-4 py-2 text-sm transition-colors duration-300 hover:border-lime hover:text-lime"
      >
        Start over
      </button>
    </section>
  );
}
