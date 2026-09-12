const ITEMS = [
  {
    title: "Authorized only",
    body: "Scan code you own or have permission to test.",
  },
  {
    title: "Static-first",
    body: "Begin with code, context, and evidence.",
  },
  {
    title: "Human review",
    body: "Generated patches remain reviewable suggestions.",
  },
  {
    title: "Transparent",
    body: "Every finding includes evidence and limitations.",
  },
] as const;

export function TrustStrip() {
  return (
    <section className="border-y border-line bg-surface/70">
      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map((item) => (
          <article key={item.title}>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-lime">{item.title}</p>
            <p className="mt-2 text-sm leading-6 text-muted">{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
