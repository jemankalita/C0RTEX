"use client";

import { StaggerGroup, StaggerItem } from "@/components/motion/Reveal";

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
      <p className="bracket">[ compare ]</p>
      <h2 className="display mt-4 max-w-xl text-4xl leading-[1.02] sm:text-6xl">
        Security context developers can use.
      </h2>
      <StaggerGroup className="panel mt-10 overflow-hidden rounded-2xl" stagger={0.12} childAs="div">
        {ROWS.map((row) => (
          <StaggerItem key={row.traditional} className="grid border-b border-line last:border-b-0 md:grid-cols-2">
            <div className="p-5">
              <p className="bracket">[ scanner ]</p>
              <p className="mt-3 text-sm leading-6 text-amber">{row.traditional}</p>
            </div>
            <div className="border-t border-line p-5 md:border-l md:border-t-0">
              <p className="bracket">[ c0rtex ]</p>
              <p className="mt-3 text-sm leading-6 text-ink">{row.cortex}</p>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
