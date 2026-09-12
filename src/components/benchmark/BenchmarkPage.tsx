"use client";

import Link from "next/link";
import { useState } from "react";
import { Footer } from "@/components/Footer";
import { GrainOverlay } from "@/components/GrainOverlay";
import { Navbar } from "@/components/Navbar";
import { Reveal } from "@/components/motion/Reveal";
import type { BenchExample, BenchReport } from "@/lib/evaluateKaggleBench";
import { formatPercent } from "@/lib/evaluateKaggleBench";

const FAMILY_LABEL: Record<string, string> = {
  injection: "Injection",
  "browser-safety": "Browser safety",
  secrets: "Secrets",
  "access-control": "Access control",
  configuration: "Configuration",
  safe: "Safe",
};

const OUTCOME_LABEL: Record<BenchExample["outcome"], string> = {
  "true-positive": "Detected",
  "true-negative": "Correctly clear",
  "false-positive": "False alarm",
  "false-negative": "Missed",
};

function MetricCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <article className="panel hud-panel rounded-2xl p-6">
      <p className="bracket">{label}</p>
      <p className="display mt-3 text-4xl text-lime">{value}</p>
      <p className="mt-2 text-sm text-muted">{hint}</p>
    </article>
  );
}

function ExampleRow({ example }: { example: BenchExample }) {
  const [open, setOpen] = useState(false);
  const tone =
    example.outcome === "true-positive" || example.outcome === "true-negative" ? "text-lime" : "text-threat";

  return (
    <article className="border-b border-line last:border-b-0">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span>
          <span className="font-mono text-xs text-cyan">{example.id}</span>
          <span className="mt-1 block text-sm">
            {FAMILY_LABEL[example.family]} · {example.cwe} · {example.language}
          </span>
        </span>
        <span className={`shrink-0 text-sm font-semibold ${tone}`}>{OUTCOME_LABEL[example.outcome]}</span>
      </button>
      {open ? (
        <div className="space-y-3 px-5 pb-5">
          <p className="text-sm text-muted">
            {example.familyMatch
              ? "Family matched the labeled CWE group."
              : example.family === "safe"
                ? "Labeled safe."
                : "No matching family, or the snippet was missed."}
          </p>
          {example.predictedRules.length > 0 ? (
            <p className="text-sm text-ink">Rules: {example.predictedRules.join(", ")}</p>
          ) : (
            <p className="text-sm text-muted">No rule fired.</p>
          )}
          <pre className="overflow-x-auto rounded-xl border border-line bg-elevated/80 p-4 font-mono text-xs leading-5 text-muted">
            {example.code}
          </pre>
        </div>
      ) : null}
    </article>
  );
}

export function BenchmarkPage({ report }: { report: BenchReport }) {
  return (
    <>
      <GrainOverlay />
      <Navbar />
      <main className="bg-black pt-28">
        <section className="mx-auto max-w-6xl px-5 pb-12">
          <Reveal>
            <p className="bracket">[ accuracy ]</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="display mt-4 max-w-3xl text-4xl leading-[1.02] sm:text-6xl">
              Held-out detection on labeled code.
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted">{report.note}</p>
          </Reveal>
        </section>

        <section className="mx-auto grid max-w-6xl gap-4 px-5 pb-16 md:grid-cols-3">
          <MetricCard label="[ f1 ]" value={formatPercent(report.f1)} hint="Harmonic mean of precision and recall." />
          <MetricCard label="[ precision ]" value={formatPercent(report.precision)} hint="Share of alerts that were labeled vulnerable." />
          <MetricCard label="[ recall ]" value={formatPercent(report.recall)} hint="Share of labeled vulnerabilities that were found." />
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-16">
          <article className="panel rounded-2xl p-6 sm:p-8">
            <p className="bracket">[ dataset ]</p>
            <h2 className="mt-3 text-2xl font-semibold">{report.title}</h2>
            <p className="mt-3 text-sm leading-7 text-muted">{report.dataset}</p>
            <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-muted">Snippets</dt>
                <dd>{report.total}</dd>
              </div>
              <div>
                <dt className="text-muted">Labeled vulnerable</dt>
                <dd>{report.vulnerable}</dd>
              </div>
              <div>
                <dt className="text-muted">Labeled safe</dt>
                <dd>{report.safe}</dd>
              </div>
            </dl>
            <p className="mt-4 text-sm text-muted">
              Confusion: {report.truePositives} detected, {report.falseNegatives} missed, {report.falsePositives} false
              alarms, {report.trueNegatives} correctly clear.
            </p>
            <a href={report.href} className="mt-5 inline-flex text-sm text-lime underline">
              View the Kaggle source dataset
            </a>
          </article>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-16">
          <p className="bracket">[ families ]</p>
          <h2 className="display mt-4 max-w-xl text-4xl leading-[1.02]">Per-class hits</h2>
          <div className="panel mt-8 overflow-hidden rounded-2xl">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Family</th>
                  <th className="px-5 py-3 font-medium">Labeled</th>
                  <th className="px-5 py-3 font-medium">Detected</th>
                  <th className="px-5 py-3 font-medium">Family match</th>
                </tr>
              </thead>
              <tbody>
                {report.families.map((row) => (
                  <tr key={row.family} className="border-b border-line last:border-b-0">
                    <td className="px-5 py-3">{FAMILY_LABEL[row.family]}</td>
                    <td className="px-5 py-3">{row.labeled}</td>
                    <td className="px-5 py-3">{row.hits}</td>
                    <td className="px-5 py-3">{row.familyHits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-20">
          <p className="bracket">[ examples ]</p>
          <h2 className="display mt-4 max-w-xl text-4xl leading-[1.02]">Inspect the labeled slice</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
            Open a snippet to see the code and which C0RTEX rule fired. Python rows are expected misses — the current
            detector is built for JavaScript and TypeScript web patterns.
          </p>
          <div className="panel mt-8 overflow-hidden rounded-2xl">
            {report.examples.map((example) => (
              <ExampleRow key={example.id} example={example} />
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/tool?demo=true" className="btn-primary">
              Start a demo scan
            </Link>
            <Link href="/" className="btn-ghost">
              Back to overview
            </Link>
          </div>
        </section>
        <Footer />
      </main>
    </>
  );
}
