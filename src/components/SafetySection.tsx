"use client";

import { StaggerGroup, StaggerItem } from "@/components/motion/Reveal";

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
    body: "Keep validation inside a sandbox or the local demo.",
  },
  {
    title: "Human approval",
    body: "Generated fixes stay suggestions until someone reviews them.",
  },
  {
    title: "Transparent limitations",
    body: "Every result includes confidence, evidence, and uncertainty.",
  },
] as const;

export function SafetySection() {
  return (
    <section id="safety" className="border-y border-line">
      <div className="mx-auto max-w-6xl px-5 py-24">
        <p className="bracket">[ safety ]</p>
        <h2 className="display mt-4 max-w-2xl text-4xl leading-[1.02] sm:text-6xl">
          Security-first design.
        </h2>
        <p className="mt-5 max-w-2xl text-[17px] leading-7 text-muted">
          Built for authorized defensive analysis. The demo stays inside the
          included repository. It does not probe arbitrary websites.
        </p>
        <StaggerGroup as="ol" className="mt-12 grid gap-4 md:grid-cols-2" childAs="li">
          {PRINCIPLES.map((item, index) => (
            <StaggerItem key={item.title} as="li" className="panel rounded-2xl p-6">
              <p className="bracket">
                {String(index + 1).padStart(2, "0")}
              </p>
              <p className="mt-3 text-base font-medium">{item.title}</p>
              <p className="mt-2 text-sm leading-6 text-muted">{item.body}</p>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
