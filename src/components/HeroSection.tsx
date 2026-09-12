"use client";

import Link from "next/link";
import { LensBotScene } from "@/components/LensBotScene";
import { useRobot } from "@/components/RobotContext";

const PATH_NODES = [
  { label: "PUBLIC ROUTE", tone: "text-cyan" },
  { label: "USER INPUT", tone: "text-amber" },
  { label: "DATABASE QUERY", tone: "text-threat" },
  { label: "SENSITIVE DATA", tone: "text-lime" },
] as const;

export function HeroSection() {
  const { setLookTarget, setStatus } = useRobot();

  return (
    <section className="relative isolate overflow-hidden pt-28">
      <video
        className="absolute inset-0 h-full w-full object-cover opacity-45"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      >
        <source src="/background.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-bg/40 via-bg/70 to-bg" />
      <div className="scan-grid scan-lines absolute inset-0 opacity-70" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 pb-20 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-cyan">
            AI security analysis for your codebase
          </p>
          <h1 className="mt-5 max-w-xl text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-6xl">
            Find the attack path before someone else does.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-muted">
            C0RTEX reads your authorized codebase like an attacker, traces
            suspicious behavior through real application paths, explains the
            impact, and helps you fix it safely.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/tool?demo=true"
              data-cursor="open"
              className="rounded-full bg-lime px-5 py-3 text-sm font-semibold text-bg"
              onMouseEnter={() => {
                setLookTarget("cta");
                setStatus("READY TO SCAN");
              }}
              onMouseLeave={() => {
                setLookTarget("idle");
                setStatus("IDLE");
              }}
            >
              Scan the demo →
            </Link>
            <a
              href="#how-it-works"
              className="rounded-full border border-line px-5 py-3 text-sm text-ink"
            >
              See how it works
            </a>
          </div>
          <p className="mt-5 text-xs uppercase tracking-[0.18em] text-muted">
            Authorized analysis · Evidence-backed findings · Reviewable fixes
          </p>
        </div>

        <div className="relative min-h-[420px]">
          <div className="pointer-events-none absolute inset-x-8 top-8 hidden flex-col gap-2 lg:flex" data-cursor="trace">
            {PATH_NODES.map((node, index) => (
              <div key={node.label} className="flex flex-col items-start">
                <span className={`rounded-full border border-line bg-bg/70 px-3 py-1 text-[10px] tracking-[0.2em] ${node.tone}`}>
                  {node.label}
                </span>
                {index < PATH_NODES.length - 1 ? (
                  <span className="ml-6 h-5 w-px bg-line" />
                ) : null}
              </div>
            ))}
          </div>

          <LensBotScene className="mx-auto h-[420px] w-full max-w-[460px] lg:h-[520px]" />

          <article
            data-cursor="inspect"
            className="absolute left-0 top-6 w-[220px] rounded-2xl border border-line bg-surface/90 p-4 text-left shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
            onMouseEnter={() => {
              setLookTarget("threat");
              setStatus("PATH DETECTED");
            }}
            onMouseLeave={() => {
              setLookTarget("idle");
              setStatus("IDLE");
            }}
          >
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted">C0RTEX threat report</p>
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-threat">High</p>
            <p className="mt-1 text-sm font-medium text-ink">Missing object authorization</p>
            <p className="mt-2 font-mono text-[11px] text-cyan">GET /api/orders/:id</p>
            <p className="mt-3 text-[11px] text-muted">Reachability: Confirmed</p>
            <p className="text-[11px] text-muted">Confidence: 93%</p>
          </article>

          <article
            data-cursor="measure"
            className="absolute bottom-4 right-0 w-[180px] rounded-2xl border border-line bg-elevated/90 p-4"
          >
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted">Application safety</p>
            <p className="mt-2 text-3xl font-semibold text-ink">64 / 100</p>
            <p className="text-xs text-amber">GRADE C</p>
          </article>
        </div>
      </div>
    </section>
  );
}
