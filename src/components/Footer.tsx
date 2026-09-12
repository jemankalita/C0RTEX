"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Reveal } from "@/components/motion/Reveal";
import { ScrambleText } from "@/components/motion/Scramble";

const SITEMAP = [
  { n: "01", label: "How it works", href: "/#how-it-works" },
  { n: "02", label: "Reports", href: "/#threat-reports" },
  { n: "03", label: "Safety", href: "/#safety" },
  { n: "04", label: "Demo", href: "/#demo" },
] as const;

const EASE = [0.16, 1, 0.3, 1] as const;

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-line bg-bg">
      {/* faint grid texture, Raven-style depth */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-5 pb-10 pt-20">
        {/* Brand block: giant pixel wordmark, Raven "About us" style */}
        <Reveal>
          <p className="bracket text-cyan">
            <ScrambleText text="[ c0rtex ]" />
          </p>
          <h2 className="pixel-heading mt-4 text-[13vw] leading-[0.95] text-white sm:text-7xl lg:text-8xl">
            Think like an attacker.
            <br />
            <span className="text-white/35">Fix like an engineer.</span>
            <span className="pixel-asterisk" aria-hidden="true">
              *
            </span>
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-12 md:grid-cols-[1fr_auto]">
          {/* Careers-style CTA block, Raven "working at raven" style */}
          <Reveal delay={0.1}>
            <div className="max-w-md">
              <p className="label text-lime">START NOW</p>
              <p className="mt-3 text-xl font-medium leading-8 text-white">
                Your code has attack paths?
              </p>
              <p className="text-xl font-medium leading-8 text-muted">
                Your rivals patch slower?
              </p>
              <p className="text-xl font-medium leading-8 text-muted">If yes — challenge us.</p>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                className="mt-6 inline-block"
              >
                <Link
                  href="/tool?demo=true"
                  className="btn-primary inline-flex items-center gap-2"
                >
                  Run the analyzer
                  <span aria-hidden="true">→</span>
                </Link>
              </motion.div>
              <p className="mt-6 text-sm text-muted">
                &ldquo;Scanning is not stressful...&rdquo;
              </p>
              <p className="text-xs text-muted/70">— C0RTEX analyst, 24 years old</p>
            </div>
          </Reveal>

          {/* Sitemap: numbered uppercase links, Raven nav-column style */}
          <Reveal delay={0.18}>
            <nav aria-label="Footer">
              <ul className="flex flex-col gap-4">
                {SITEMAP.map(({ n, label, href }) => (
                  <li key={href}>
                    <a
                      href={href}
                      className="group flex items-baseline gap-3 text-lg font-bold uppercase tracking-[0.08em] text-white transition-colors hover:text-lime"
                    >
                      <span className="font-mono text-[11px] font-normal text-muted transition-colors group-hover:text-lime">
                        [ {n} ]
                      </span>
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </Reveal>
        </div>

        {/* Bottom row: disclaimer + year */}
        <div className="mt-20 flex flex-col gap-2 border-t border-line pt-6 text-xs leading-6 text-muted md:flex-row md:items-center md:justify-between">
          <p>
            C0RTEX is for authorized defensive analysis. It does not guarantee that an
            application is secure.
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted/70">
            © {new Date().getFullYear()} c0rtex
          </p>
        </div>
      </div>
    </footer>
  );
}
