const FEATURES = [
  {
    title: "Context-aware analysis",
    body: "Understand routes, middleware, functions, sinks, and surrounding code.",
    visual: "graph",
  },
  {
    title: "Attacker-style reasoning",
    body: "Reconstruct how a user could move from entry point to sensitive operation.",
    visual: "path",
  },
  {
    title: "Transparent severity",
    body: "Show why a finding is high, medium, low, or needs review.",
    visual: "radar",
  },
  {
    title: "Attack-path visualization",
    body: "Make the route from input to impact visible.",
    visual: "nodes",
  },
  {
    title: "Reviewable patches",
    body: "Generate minimal changes developers can inspect before applying.",
    visual: "diff",
  },
  {
    title: "Post-fix verification",
    body: "Rerun the relevant check and show whether the risk was reduced.",
    visual: "score",
  },
] as const;

function FeatureVisual({ kind }: { kind: (typeof FEATURES)[number]["visual"] }) {
  if (kind === "graph") {
    return (
      <svg viewBox="0 0 80 40" className="h-10 w-20" aria-hidden="true">
        <circle cx="10" cy="20" r="3" fill="#54D7FF" />
        <circle cx="40" cy="12" r="3" fill="#FFC857" />
        <circle cx="70" cy="28" r="3" fill="#B8FF4D" />
        <path d="M13 20 L37 13 M43 14 L67 27" stroke="rgba(160,180,210,0.4)" />
      </svg>
    );
  }
  if (kind === "path") {
    return (
      <svg viewBox="0 0 80 40" className="h-10 w-20" aria-hidden="true">
        <path d="M8 30 C24 8, 48 36, 72 12" stroke="#54D7FF" fill="none" />
        <circle cx="72" cy="12" r="3" fill="#FF5C68" />
      </svg>
    );
  }
  if (kind === "radar") {
    return (
      <svg viewBox="0 0 80 40" className="h-10 w-20" aria-hidden="true">
        <circle cx="40" cy="20" r="14" stroke="rgba(184,255,77,0.4)" />
        <circle cx="40" cy="20" r="7" stroke="#54D7FF" />
        <circle cx="40" cy="20" r="2" fill="#B8FF4D" />
      </svg>
    );
  }
  if (kind === "nodes") {
    return (
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-cyan">
        IN <span className="text-muted">→</span> CHK <span className="text-muted">→</span>{" "}
        <span className="text-threat">SINK</span>
      </div>
    );
  }
  if (kind === "diff") {
    return (
      <pre className="font-mono text-[10px] leading-4">
        <span className="text-threat">- findById</span>
        {"\n"}
        <span className="text-lime">+ findOne</span>
      </pre>
    );
  }
  return <p className="font-mono text-lg text-lime">64 → 86</p>;
}

export function FeatureGrid() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24">
      <p className="text-[11px] uppercase tracking-[0.28em] text-cyan">Built for developers</p>
      <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight sm:text-5xl">
        Security reasoning without the noise.
      </h2>
      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {FEATURES.map((feature) => (
          <article key={feature.title} className="rounded-3xl border border-line bg-surface p-6">
            <FeatureVisual kind={feature.visual} />
            <h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">{feature.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
