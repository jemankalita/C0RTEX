import type { ScanSummary } from "@/types/security";

type ApplicationMapProps = {
  summary: ScanSummary;
  resolved: boolean;
};

const nodes = ["Routes", "Controllers", "Services", "Database/API"];

export function ApplicationMap({ summary, resolved }: ApplicationMapProps) {
  return (
    <section className="panel rounded-2xl p-5">
      <p className="label">Application attack surface</p>
      <div className="mt-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
        <Metric label="Public routes" value={summary.publicRoutes} />
        <Metric label="Authenticated routes" value={summary.authenticatedRoutes} />
        <Metric label="Admin routes" value={summary.adminRoutes} />
        <Metric label="Database sinks" value={summary.databaseSinks} />
        <Metric label="External API calls" value={summary.externalApiCalls} />
        <Metric label="Sensitive operations" value={summary.sensitiveOperations} />
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        {nodes.map((node, index) => (
          <div key={node} className="flex items-center gap-2">
            <div
              className={`rounded-lg border px-3 py-2 text-xs font-mono ${
                resolved ? "border-lime text-lime" : index > 1 ? "border-threat text-threat" : "border-cyan text-cyan"
              }`}
            >
              {node}
            </div>
            {index < nodes.length - 1 ? <span className="text-muted">→</span> : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-muted">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}
