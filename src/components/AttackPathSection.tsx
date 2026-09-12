"use client";

import { AttackPathGraph } from "@/components/AttackPathGraph";
import { Reveal } from "@/components/motion/Reveal";

export function AttackPathSection() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24">
      <Reveal>
        <p className="bracket">[ path ]</p>
      </Reveal>
      <Reveal delay={0.08}>
        <h2 className="display mt-4 max-w-2xl text-4xl leading-[1.02] sm:text-6xl">
          Follow the evidence from entry to impact.
        </h2>
      </Reveal>
      <Reveal delay={0.18} y={44} className="mt-10">
        <AttackPathGraph />
      </Reveal>
    </section>
  );
}
