import { AttackPathGraph } from "@/components/AttackPathGraph";

export function AttackPathSection() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24">
      <p className="text-[11px] uppercase tracking-[0.28em] text-cyan">
        Attack paths, not just alerts
      </p>
      <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl">
        Follow the evidence from entry point to impact.
      </h2>
      <div className="mt-10">
        <AttackPathGraph />
      </div>
    </section>
  );
}
