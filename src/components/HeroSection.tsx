"use client";

import Link from "next/link";
import { CircuitBoard } from "@/components/CircuitBoard";
import { LensBotScene } from "@/components/LensBotScene";
import { HeroHeadline, HeroScrollFade } from "@/components/motion/HeroMotion";
import { Reveal } from "@/components/motion/Reveal";
import { ScrambleText } from "@/components/motion/Scramble";
import { useRobot } from "@/components/RobotContext";
import { SiteBackground } from "@/components/SiteBackground";

export function HeroSection() {
  const { setLookTarget, setStatus } = useRobot();

  return (
    <section className="relative isolate min-h-screen overflow-hidden pt-28">
      <SiteBackground dim="light" />
      <CircuitBoard className="pointer-events-none absolute inset-x-0 bottom-0 h-[46vh] w-full opacity-70" />
      <div className="scanlines" aria-hidden="true" />
      <HeroScrollFade className="relative z-10 mx-auto grid max-w-6xl items-center gap-8 px-5 pb-20 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="bracket">
            <ScrambleText text="[ analyst ]" />
          </p>
          <HeroHeadline
            text="The AI security analyst."
            accent
            className="pixel-heading mt-5 max-w-3xl text-4xl text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.65)] sm:text-6xl xl:text-7xl"
          />
          <Reveal delay={0.55} y={24}>
            <p className="mt-6 max-w-md text-[18px] font-medium leading-7 text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
              C0RTEX reads an authorized codebase like an attacker, traces the path
              that actually matters, and hands you a reviewable fix.
            </p>
          </Reveal>
          <Reveal delay={0.7} y={24}>
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
          </Reveal>
          <Reveal delay={0.85} y={20}>
            <p className="mt-6 text-sm font-medium text-white/90">
              Authorized analysis only. Evidence first. Human review on every patch.
              <span className="blink-cursor" aria-hidden="true" />
            </p>
          </Reveal>
          <Reveal delay={1.05} y={14}>
            <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.3em] text-white/45">
              scroll to learn more...
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.4} y={36} className="relative min-h-[420px]">
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
        </Reveal>
      </HeroScrollFade>
    </section>
  );
}
