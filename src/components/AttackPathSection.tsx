import { AttackPathGraph } from "@/components/AttackPathGraph";

export function AttackPathSection() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24">
      <p className="bracket">[ path ]</p>
      <h2 className="display mt-4 max-w-2xl text-4xl leading-[1.02] sm:text-6xl">
        Follow the evidence from entry to impact.
      </h2>
      <div className="mt-10">
        <AttackPathGraph />
      </div>
    </section>
  );
}
