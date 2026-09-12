const CARDS = [
  {
    title: "Pattern without context",
    body: "A dangerous-looking function is not automatically an exploitable path.",
  },
  {
    title: "Noise without priority",
    body: "Long warning lists hide the one finding that can actually be reached.",
  },
  {
    title: "Findings without a fix",
    body: "Developers need evidence, impact, and a patch they can review.",
  },
] as const;

export function ProblemSection() {
  return (
    <section id="problem" className="mx-auto max-w-6xl px-5 py-24">
      <p className="bracket">[ problem ]</p>
      <h2 className="display mt-4 max-w-xl text-4xl leading-[1.02] sm:text-6xl">
        A warning is not an explanation.
      </h2>
      <p className="mt-5 max-w-2xl text-[17px] leading-7 text-muted">
        Scanners flag functions. Teams still need to know if an attacker can
        reach them, what breaks, and how to fix it without taking the app down.
      </p>

      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {CARDS.map((card) => (
          <article key={card.title} className="panel rounded-2xl p-6">
            <h3 className="text-base font-medium">{card.title}</h3>
            <p className="mt-3 text-sm leading-6 text-muted">{card.body}</p>
          </article>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <article className="panel rounded-2xl p-6">
          <p className="bracket">[ before ]</p>
          <p className="mt-4 font-mono text-sm text-amber">
            Possible SQL injection detected at line 42.
          </p>
        </article>
        <article className="panel rounded-2xl p-6">
          <p className="bracket">[ after ]</p>
          <p className="mt-4 text-sm leading-6 text-ink">
            Public search route → user-controlled query → raw database call.
          </p>
          <p className="mt-3 text-sm text-muted">High · 92% confidence · parameterized query.</p>
        </article>
      </div>
    </section>
  );
}
