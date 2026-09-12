"use client";

import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { KAGGLE_BENCH_SAMPLES } from "@/data/kaggleBenchSamples";
import { evaluateKaggleBench, formatPercent } from "@/lib/evaluateKaggleBench";

const REPORT = evaluateKaggleBench(KAGGLE_BENCH_SAMPLES);

export function AccuracySection() {
  return (
    <section id="accuracy" className="mx-auto max-w-6xl px-5 py-24">
      <Reveal>
        <p className="bracket">[ accuracy ]</p>
      </Reveal>
      <Reveal delay={0.08}>
        <h2 className="display mt-4 max-w-xl text-4xl leading-[1.02] sm:text-6xl">
          Measured on labeled snippets.
        </h2>
      </Reveal>
      <Reveal delay={0.16}>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted">{REPORT.note}</p>
      </Reveal>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <article className="panel hud-panel rounded-2xl p-6">
          <p className="bracket">[ f1 ]</p>
          <p className="mt-3 text-4xl text-lime">{formatPercent(REPORT.f1)}</p>
        </article>
        <article className="panel hud-panel rounded-2xl p-6">
          <p className="bracket">[ samples ]</p>
          <p className="mt-3 text-4xl text-lime">{REPORT.total}</p>
        </article>
        <article className="panel hud-panel rounded-2xl p-6">
          <p className="bracket">[ recall ]</p>
          <p className="mt-3 text-4xl text-lime">{formatPercent(REPORT.recall)}</p>
        </article>
      </div>
      <Link href="/benchmark" className="btn-primary mt-8">
        View the bench
      </Link>
    </section>
  );
}
