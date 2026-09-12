const ROWS = [
  {
    traditional: "Possible SQL injection at line 42.",
    cortex:
      "This public route passes user-controlled input into a raw database query. An attacker may alter query behavior and access unintended records. Use a parameterized query.",
  },
  {
    traditional: "Flat list of findings.",
    cortex: "Prioritized findings with reachability and confidence.",
  },
  {
    traditional: "Generic remediation guidance.",
    cortex: "Minimal, reviewable code diff.",
  },
  {
    traditional: "No clear result after fixing.",
    cortex: "Recheck the path and show the score change.",
  },
] as const;

export function DifferentiationSection() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24">
      <p className="text-[11px] uppercase tracking-[0.28em] text-amber">Beyond pattern matching</p>
      <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight sm:text-5xl">
        Security context developers can use.
      </h2>
      <div className="mt-10 overflow-hidden rounded-3xl border border-line">
        {ROWS.map((row) => (
          <div key={row.traditional} className="grid border-b border-line last:border-b-0 md:grid-cols-2">
            <div className="bg-elevated p-5">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted">Traditional scanner</p>
              <p className="mt-3 text-sm leading-6 text-amber">{row.traditional}</p>
            </div>
            <div className="bg-surface p-5">
              <p className="text-[11px] uppercase tracking-[0.18em] text-lime">C0RTEX</p>
              <p className="mt-3 text-sm leading-6 text-ink">{row.cortex}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
