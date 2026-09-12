import type { SecurityFinding } from "@/types/security";

export function EvidencePanel({ finding }: { finding: SecurityFinding }) {
  return (
    <section className="panel rounded-2xl p-5">
      <p className="label">Evidence</p>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">
        {finding.evidence.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="mt-4 font-mono text-sm text-cyan">Code path confidence {finding.confidence}%</p>
      <div className="mt-4">
        <p className="label">Limitations</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
          {finding.limitations.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
