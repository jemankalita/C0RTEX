"use client";

import Link from "next/link";
import { LensBotScene } from "@/components/LensBotScene";
import { useRobot } from "@/components/RobotContext";
import { SiteBackground } from "@/components/SiteBackground";

export function HeroSection() {
  const { setLookTarget, setStatus } = useRobot();

  return (
    <section className="relative isolate min-h-screen overflow-hidden pt-28">
      <SiteBackground dim="light" />
      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-8 px-5 pb-20 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="bracket">[ analyst ]</p>
          <h1 className="display mt-5 max-w-xl text-5xl leading-[0.96] text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.55)] sm:text-7xl">
            The AI security analyst.
          </h1>
          <p className="mt-6 max-w-md text-[18px] font-medium leading-7 text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
            C0RTEX reads an authorized codebase like an attacker, traces the path
            that actually matters, and hands you a reviewable fix.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/tool?demo=true"
              className="btn-primary"
              onMouseEnter={() => {
                setLookTarget("cta");
                setStatus("READY TO SCAN");
              }}
              onMouseLeave={() => {
                setLookTarget("idle");
                setStatus("IDLE");
              }}
            >
              Start now
            </Link>
            <a href="#how-it-works" className="btn-ghost">
              How it works
            </a>
          </div>
          <p className="mt-6 text-sm font-medium text-white/90">
            Authorized analysis only. Evidence first. Human review on every patch.
          </p>
        </div>

        <div className="relative min-h-[420px]">
          <LensBotScene className="mx-auto h-[440px] w-full max-w-[520px] lg:h-[560px]" />

          <article
            className="panel absolute left-0 top-8 hidden w-[230px] rounded-xl p-4 lg:block"
            onMouseEnter={() => {
              setLookTarget("threat");
              setStatus("PATH DETECTED");
            }}
            onMouseLeave={() => {
              setLookTarget("idle");
              setStatus("IDLE");
            }}
          >
            <p className="bracket">[ finding ]</p>
            <p className="mt-2 text-sm font-medium text-ink">Missing object authorization</p>
            <p className="mt-2 font-mono text-[12px] text-muted">GET /api/orders/:id</p>
            <p className="mt-3 text-[12px] text-muted">Reachable · 93% confidence</p>
          </article>

          <article className="panel absolute bottom-6 right-0 hidden w-[168px] rounded-xl p-4 lg:block">
            <p className="bracket">[ score ]</p>
            <p className="mt-2 text-3xl text-ink">64</p>
            <p className="text-sm text-muted">Grade C · 100</p>
          </article>
        </div>
      </div>
    </section>
  );
}
