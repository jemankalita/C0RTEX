"use client";

import { useState } from "react";
import type { BenchProof, BenchProofWitness, BenchSnippetScan } from "@/lib/benchProof";
import { formatPercent } from "@/lib/evaluateKaggleBench";

const DEFAULT_LIVE_SNIPPET =
  "export function lookup(req: any) {\n  return db.query(`SELECT * FROM accounts WHERE id = '${req.query.id}'`);\n}\n";

const ROLE_LABEL: Record<BenchProofWitness["role"], string> = {
  detected: "Detected",
  missed: "Missed",
  clear: "Correctly clear",
};

type Envelope<T> = { success: boolean; data: T | null; error: string | null };

async function readEnvelope<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as Envelope<T>;
  if (!payload.success || !payload.data) {
    throw new Error(payload.error ?? "Verification request failed.");
  }
  return payload.data;
}

function WitnessCard({ witness }: { witness: BenchProofWitness }) {
  const tone = witness.role === "missed" ? "text-threat" : "text-lime";
  return (
    <article className="panel hud-panel rounded-2xl p-5">
      <p className="bracket">[ {witness.role} ]</p>
      <p className={`mt-3 text-sm font-semibold ${tone}`}>{ROLE_LABEL[witness.role]}</p>
      <p className="mt-1 font-mono text-xs text-cyan">{witness.id}</p>
      <p className="mt-2 text-sm text-muted">
        {witness.predictedRules.length > 0
          ? `Rules fired: ${witness.predictedRules.join(", ")}`
          : "No rule fired."}
      </p>
      <pre className="mt-3 overflow-x-auto rounded-xl border border-line bg-elevated/80 p-3 font-mono text-xs leading-5 text-muted">
        {witness.code}
      </pre>
    </article>
  );
}

export function BenchProofPanel({ initialProof }: { initialProof: BenchProof }) {
  const [proof, setProof] = useState(initialProof);
  const [recomputeError, setRecomputeError] = useState<string | null>(null);
  const [recomputing, setRecomputing] = useState(false);
  const [code, setCode] = useState(DEFAULT_LIVE_SNIPPET);
  const [liveResult, setLiveResult] = useState<(BenchSnippetScan & { scannedAt: string }) | null>(null);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  async function recompute() {
    setRecomputing(true);
    setRecomputeError(null);
    try {
      const next = await readEnvelope<BenchProof>(await fetch("/api/benchmark/verify", { cache: "no-store" }));
      setProof(next);
    } catch (error) {
      setRecomputeError(error instanceof Error ? error.message : "Could not recompute the bench.");
    } finally {
      setRecomputing(false);
    }
  }

  async function scanLive() {
    setScanning(true);
    setLiveError(null);
    try {
      const next = await readEnvelope<BenchSnippetScan & { scannedAt: string }>(
        await fetch("/api/benchmark/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, path: "src/lookup.ts", language: "TypeScript" }),
        }),
      );
      setLiveResult(next);
    } catch (error) {
      setLiveError(error instanceof Error ? error.message : "Could not scan that snippet.");
    } finally {
      setScanning(false);
    }
  }

  return (
    <section id="proof" className="mx-auto max-w-6xl px-5 pb-16">
      <p className="bracket">[ proof ]</p>
      <h2 className="display mt-4 max-w-2xl text-4xl leading-[1.02]">Not a hardcoded scoreboard.</h2>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
        {proof.method} The three cards below are a hit, a miss, and a safe snippet from the same run. Recompute
        to get a fresh server timestamp — the numbers come from <span className="text-ink">{proof.engine}</span>,
        not from copy in the page.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button type="button" className="btn-primary" onClick={() => void recompute()} disabled={recomputing}>
          {recomputing ? "Recomputing…" : "Recompute on the server"}
        </button>
        <p className="font-mono text-xs text-cyan">GET /api/benchmark/verify · {proof.computedAt}</p>
      </div>
      {recomputeError ? <p className="mt-3 text-sm text-threat">{recomputeError}</p> : null}

      <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-muted">F1</dt>
          <dd>{formatPercent(proof.metrics.f1)}</dd>
        </div>
        <div>
          <dt className="text-muted">Detected / missed</dt>
          <dd>
            {proof.metrics.truePositives} / {proof.metrics.falseNegatives}
          </dd>
        </div>
        <div>
          <dt className="text-muted">False alarms</dt>
          <dd>{proof.metrics.falsePositives}</dd>
        </div>
        <div>
          <dt className="text-muted">Correctly clear</dt>
          <dd>{proof.metrics.trueNegatives}</dd>
        </div>
      </dl>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {proof.witnesses.map((witness) => (
          <WitnessCard key={witness.role} witness={witness} />
        ))}
      </div>

      <article className="panel mt-8 rounded-2xl p-6 sm:p-8">
        <p className="bracket">[ live snippet ]</p>
        <h3 className="mt-3 text-xl font-semibold">Scan code that is not in the bench list</h3>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">
          This default snippet is not one of the checked-in sample IDs. Edit it and scan — the response is produced
          by the same engine. Open the Network tab to see POST /api/benchmark/verify.
        </p>
        <label className="mt-5 block text-sm text-muted" htmlFor="bench-live-snippet">
          TypeScript snippet
        </label>
        <textarea
          id="bench-live-snippet"
          className="mt-2 min-h-36 w-full rounded-xl border border-line bg-elevated/80 p-4 font-mono text-xs leading-5 text-ink"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          spellCheck={false}
        />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" className="btn-primary" onClick={() => void scanLive()} disabled={scanning}>
            {scanning ? "Scanning…" : "Scan this snippet"}
          </button>
          {liveResult ? (
            <p className="font-mono text-xs text-cyan">scanned {liveResult.scannedAt}</p>
          ) : null}
        </div>
        {liveError ? <p className="mt-3 text-sm text-threat">{liveError}</p> : null}
        {liveResult ? (
          <p className="mt-4 text-sm text-ink">
            {liveResult.predictedRules.length > 0
              ? `Rules fired: ${liveResult.predictedRules.join(", ")}`
              : "No rule fired on this snippet."}
          </p>
        ) : null}
      </article>
    </section>
  );
}
