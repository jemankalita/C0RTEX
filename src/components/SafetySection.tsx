const PRINCIPLES = [
  {
    title: "Authorization required",
    body: "Only scan applications you own or are authorized to test.",
  },
  {
    title: "Static-first analysis",
    body: "Start from code, context, and evidence.",
  },
  {
    title: "Controlled validation",
    body: "Keep validation inside a sandbox or local demo environment.",
  },
  {
    title: "Human approval",
    body: "Generated fixes remain suggestions until a developer reviews them.",
  },
  {
    title: "Transparent limitations",
    body: "Every result includes confidence, evidence, and uncertainty.",
  },
] as const;

export function SafetySection() {
  return (
    <section id="safety" className="border-y border-line bg-surface/60">
      <div className="mx-auto max-w-6xl px-5 py-24">
        <p className="text-[11px] uppercase tracking-[0.28em] text-lime">Security-first by design</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl">
          Attacker-style reasoning. Developer-safe execution.
        </h2>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted">
          C0RTEX is designed for authorized defensive analysis. The MVP analyzes
          uploaded code and controlled demo applications. It does not probe
          arbitrary websites or silently modify repositories.
        </p>
        <ol className="mt-10 grid gap-4 md:grid-cols-2">
          {PRINCIPLES.map((item, index) => (
            <li key={item.title} className="rounded-3xl border border-line bg-bg p-6">
              <p className="text-[11px] uppercase tracking-[0.2em] text-cyan">
                0{index + 1} {item.title}
              </p>
              <p className="mt-3 text-sm leading-6 text-muted">{item.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
