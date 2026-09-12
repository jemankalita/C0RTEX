const ITEMS = [
  { title: "Authorized only", body: "Scan code you own or have permission to test." },
  { title: "Static-first", body: "Start from code, context, and evidence." },
  { title: "Human review", body: "Generated patches stay reviewable suggestions." },
  { title: "Transparent", body: "Every finding includes evidence and limits." },
] as const;

export function TrustStrip() {
  return (
    <section className="border-y border-line">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map((item) => (
          <article key={item.title}>
            <p className="text-sm font-medium text-ink">{item.title}</p>
            <p className="mt-2 text-sm leading-6 text-muted">{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
