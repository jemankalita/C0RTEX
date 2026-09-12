"use client";

import { useState } from "react";
import { SlideIn } from "@/components/motion/SlideIn";

const steps = [
  ["Pattern detection", "Deterministic rules identify suspicious code patterns."],
  ["Context extraction", "C0RTEX collects nearby routes, functions, middleware, tests, and sinks."],
  ["Path reasoning", "The system evaluates whether user-controlled data can reach a sensitive operation."],
  ["Risk scoring", "Severity considers impact, exposure, reachability, and confidence."],
  ["Remediation", "The system proposes a minimal reviewable patch."],
  ["Recheck", "The relevant rule is run again after the patch is applied."],
];

export function HowItWorksPanel() {
  const [open, setOpen] = useState(false);

  return (
    <section className="panel rounded-2xl p-5">
      <button
        type="button"
        className="flex w-full items-center justify-between text-left"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="label">How C0RTEX works</span>
        <span className="text-sm text-muted">{open ? "Hide" : "Show"}</span>
      </button>
      <SlideIn from="bottom" present={open}>
        <div className="mt-4 space-y-3">
          <ol className="space-y-2 text-sm text-muted">
            {steps.map(([title, copy], index) => (
              <li key={title}>
                <p className="text-ink">
                  {index + 1}. {title}
                </p>
                <p>{copy}</p>
              </li>
            ))}
          </ol>
          <p className="font-mono text-xs text-cyan">
            Pattern → Context → Reachability → Impact → Patch → Recheck
          </p>
          <p className="text-xs text-muted">
            C0RTEX combines deterministic analysis with AI-assisted explanation. AI output is
            treated as an assessment requiring human review, not as a security guarantee.
          </p>
        </div>
      </SlideIn>
    </section>
  );
}
