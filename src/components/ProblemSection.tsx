"use client";

import { motion } from "framer-motion";

const CARDS = [
  {
    title: "Pattern without context",
    body: "A dangerous function does not automatically mean an exploitable vulnerability.",
  },
  {
    title: "Noise without priority",
    body: "Large warning lists hide the findings that actually matter.",
  },
  {
    title: "Findings without a fix",
    body: "Developers need evidence, impact, and a reviewable patch.",
  },
] as const;

export function ProblemSection() {
  return (
    <section id="problem" className="mx-auto max-w-6xl px-5 py-24">
      <p className="text-[11px] uppercase tracking-[0.28em] text-amber">The problem</p>
      <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight sm:text-5xl">
        A warning is not an explanation.
      </h2>
      <p className="mt-5 max-w-2xl text-base leading-7 text-muted">
        Traditional scanners can flag a dangerous-looking function, but developers
        still need to know whether an attacker can reach it, what the real impact
        would be, and how to fix it without breaking the application.
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {CARDS.map((card) => (
          <article key={card.title} className="rounded-2xl border border-line bg-surface p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em]">{card.title}</h3>
            <p className="mt-3 text-sm leading-6 text-muted">{card.body}</p>
          </article>
        ))}
      </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        <motion.article
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          className="rounded-2xl border border-line bg-elevated p-6"
        >
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Before</p>
          <p className="mt-3 font-mono text-sm text-amber">
            Possible SQL injection detected at line 42.
          </p>
        </motion.article>
        <motion.article
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ delay: 0.12 }}
          className="rounded-2xl border border-lime/25 bg-surface p-6"
        >
          <p className="text-[11px] uppercase tracking-[0.2em] text-lime">After</p>
          <p className="mt-3 text-sm text-ink">
            Public search route → user-controlled query → raw database call
          </p>
          <p className="mt-4 text-sm text-muted">Severity: High</p>
          <p className="text-sm text-muted">Confidence: 92%</p>
          <p className="text-sm text-muted">Suggested fix: Use a parameterized query.</p>
        </motion.article>
      </div>
    </section>
  );
}
