"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { createDemoFindings } from "@/data/demoFindings";

const GLYPHS = "ABCDEF0123456789<>/\\[]{}=+#$%&";
const CYCLE_MS = 4200;
const DECODE_MS = 700;

function useDecoding(target: string, active: boolean) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(target);

  useEffect(() => {
    if (!active || reduced) {
      setDisplay(target);
      return;
    }
    let frame = 0;
    const totalFrames = Math.max(1, Math.floor(DECODE_MS / 32));
    const interval = window.setInterval(() => {
      frame += 1;
      if (frame >= totalFrames) {
        setDisplay(target);
        window.clearInterval(interval);
        return;
      }
      setDisplay(
        target
          .split("")
          .map((char, index) => {
            if (char === " ") return " ";
            const locked = index / Math.max(target.length, 1) < frame / totalFrames;
            return locked ? char : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          })
          .join(""),
      );
    }, 32);
    return () => window.clearInterval(interval);
  }, [target, active, reduced]);

  return display;
}

/** Hero "[ FINDING ]" card that keeps cycling through real findings, decoding each. */
export function HeroFindingTicker() {
  const reduced = useReducedMotion();
  const [findings] = useState(() => createDemoFindings());
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const interval = window.setInterval(() => {
      setIndex((value) => (value + 1) % findings.length);
    }, CYCLE_MS);
    return () => window.clearInterval(interval);
  }, [findings.length, reduced]);

  const finding = findings[index];
  const active = !reduced;
  const title = useDecoding(finding.title, active);
  const route = useDecoding(finding.attackPath[0]?.label ?? finding.locationLabel, active);
  const confidence = useDecoding(`${finding.reachability} · ${finding.confidence}% confidence`, active);

  return (
    <article
      className="panel absolute left-0 top-8 hidden w-[248px] rounded-xl p-4 lg:block"
      onMouseEnter={() => undefined}
      aria-live="off"
    >
      <p className="bracket">
        [ finding ]
        <motion.span
          className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-lime align-middle"
          animate={active ? { opacity: [1, 0.15, 1] } : undefined}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden="true"
        />
      </p>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={finding.id}
          initial={active ? { opacity: 0, y: 10 } : false}
          animate={{ opacity: 1, y: 0 }}
          exit={active ? { opacity: 0, y: -10 } : undefined}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="mt-2 min-h-[2.6em] text-sm font-medium text-ink">{title}</p>
          <p className="mt-2 min-h-[1.4em] font-mono text-[12px] text-muted">{route}</p>
          <p className="mt-3 min-h-[1.4em] text-[12px] text-muted">{confidence}</p>
        </motion.div>
      </AnimatePresence>
    </article>
  );
}

/** Hero "[ SCORE ]" card whose number keeps ticking while the "robot works". */
export function HeroScoreTicker() {
  const reduced = useReducedMotion();

  return (
    <article className="panel absolute bottom-6 right-0 hidden w-[168px] rounded-xl p-4 lg:block">
      <p className="bracket">[ score ]</p>
      {reduced ? (
        <>
          <p className="mt-2 text-3xl text-ink">64</p>
          <p className="text-sm text-muted">Grade C · 100</p>
        </>
      ) : (
        <ScoreOscillator />
      )}
    </article>
  );
}

function ScoreOscillator() {
  const [value, setValue] = useState(64);

  useEffect(() => {
    // Drift between realistic assessment values — reads as live computation.
    const targets = [58, 61, 64, 62, 66, 63, 60, 64];
    let i = 0;
    const interval = window.setInterval(() => {
      i = (i + 1) % targets.length;
      setValue(targets[i]);
    }, 1400);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <>
      <motion.p
        className="mt-2 font-mono text-3xl text-ink tabular-nums"
        animate={{ opacity: [1, 0.75, 1] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      >
        {value}
      </motion.p>
      <p className="text-sm text-muted">Grade C · 100</p>
      <p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted">
        <motion.span
          className="inline-block h-1 w-1 rounded-full bg-cyan"
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 0.9, repeat: Infinity }}
          aria-hidden="true"
        />
        analyzing…
      </p>
    </>
  );
}
