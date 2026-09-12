"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Reveal } from "@/components/motion/Reveal";
import { ScrambleText } from "@/components/motion/Scramble";
import { isValidGitHubRepoUrl } from "@/lib/githubUrl";
import type { DemoRepository, ScanMode, SourceKind, ThreatLens } from "@/types/security";

type RepositorySelectorProps = {
  repository: DemoRepository;
  source: SourceKind;
  onSourceChange: (source: SourceKind) => void;
  authorized: boolean;
  onStart: () => void;
  demoMode: boolean;
  skipAnimation: boolean;
  onSkipAnimationChange: (value: boolean) => void;
  compact?: boolean;
  scanMode?: ScanMode;
  onScanModeChange?: (mode: ScanMode) => void;
  lenses?: ThreatLens[];
  onLensesChange?: (lenses: ThreatLens[]) => void;
};

export function RepositorySelector({
  repository,
  source,
  onSourceChange,
  authorized,
  onStart,
  demoMode,
  skipAnimation,
  onSkipAnimationChange,
  compact = false,
  scanMode = "auto",
  onScanModeChange,
  lenses = [],
  onLensesChange,
}: RepositorySelectorProps) {
  const [githubUrl, setGithubUrl] = useState("");
  const [zipNote, setZipNote] = useState(false);
  const githubValid = githubUrl.length === 0 || isValidGitHubRepoUrl(githubUrl);

  if (compact) {
    return (
      <section className="panel hud-panel rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="label text-cyan">Demo repository</p>
            <p className="pixel-heading mt-1 text-lg text-white/90">{repository.name}</p>
          </div>
          <p className="flex items-center gap-2 text-sm text-lime">
            <span className="h-1.5 w-1.5 rounded-full bg-lime shadow-[0_0_10px_#B8FF4D]" aria-hidden="true" />
            Authorized demo copy in review
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="panel hud-panel rounded-2xl p-5">
      <p className="label text-cyan">
        <ScrambleText text="C0RTEX analyzer" />
      </p>
      <h1 className="pixel-heading mt-2 text-3xl text-white sm:text-4xl">
        Analyze an authorized codebase like an attacker.
        <span className="pixel-asterisk" aria-hidden="true">
          *
        </span>
      </h1>
      <Reveal delay={0.15}>
        <p className="mt-2 text-sm text-muted">
          Map the attack surface, trace risky paths, understand the impact, and generate a
          reviewable fix.
        </p>
      </Reveal>

      <Reveal delay={0.25} className="mt-4 rounded-xl border border-line bg-elevated/80 p-4">
        <p className="label">Demo repository</p>
        <p className="mt-1 text-lg font-semibold">{repository.name}</p>
        <p className="text-sm text-muted">{repository.description}</p>
        <dl className="mt-3 grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
          <div>
            <dt className="text-muted">Type</dt>
            <dd>Node.js + TypeScript</dd>
          </div>
          <div>
            <dt className="text-muted">Files</dt>
            <dd>{repository.files}</dd>
          </div>
          <div>
            <dt className="text-muted">Routes</dt>
            <dd>{repository.routes}</dd>
          </div>
          <div>
            <dt className="text-muted">Status</dt>
            <dd className="text-lime">Ready to scan</dd>
          </div>
        </dl>
      </Reveal>

      <div className="mt-4 flex flex-wrap gap-2">
        {(
          [
            ["demo", "Use demo repository"],
            ["zip", "Upload ZIP"],
            ["github", "Paste GitHub URL"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => onSourceChange(value)}
            className={`rounded-full border px-3 py-2 text-sm ${
              source === value ? "border-cyan text-cyan" : "border-line text-muted"
            }`}
            aria-pressed={source === value}
          >
            {label}
          </button>
        ))}
      </div>

      {source === "zip" ? (
        <div className="mt-3">
          <input type="file" accept=".zip" onChange={() => setZipNote(true)} className="text-sm" />
          {zipNote ? (
            <p className="mt-2 text-sm text-amber">
              ZIP ingestion is available in the product flow. The hackathon demo currently uses the
              built-in vulnerable-shop repository.
            </p>
          ) : null}
        </div>
      ) : null}

      {source === "github" ? (
        <div className="mt-3">
          <label className="text-sm" htmlFor="github-url">
            GitHub repository URL
          </label>
          <input
            id="github-url"
            value={githubUrl}
            onChange={(event) => setGithubUrl(event.target.value)}
            placeholder="https://github.com/org/repo"
            className="mt-1 w-full rounded-lg border border-line bg-bg px-3 py-2 font-mono text-sm"
          />
          {!githubValid ? (
            <p className="mt-2 text-sm text-threat">Enter a valid GitHub repository URL.</p>
          ) : githubUrl ? (
            <p className="mt-2 text-sm text-amber">
              For this demo, scans run against the built-in repository. GitHub scanning is planned
              for the full version.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {(
          [
            ["auto", "Auto mode"],
            ["guided", "Guided mode"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => onScanModeChange?.(value)}
            className={`rounded-full border px-3 py-2 text-sm ${
              scanMode === value ? "border-lime text-lime" : "border-line text-muted"
            }`}
            aria-pressed={scanMode === value}
          >
            {label}
          </button>
        ))}
      </div>

      {scanMode === "guided" ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {(
            [
              ["access-control", "Access control"],
              ["injection", "Injection"],
              ["browser-safety", "Browser safety"],
              ["secrets", "Secrets"],
              ["configuration", "Configuration"],
            ] as const
          ).map(([value, label]) => {
            const active = lenses.includes(value);
            return (
              <button
                key={value}
                type="button"
                onClick={() => {
                  onLensesChange?.(
                    active ? lenses.filter((lens) => lens !== value) : [...lenses, value],
                  );
                }}
                className={`rounded-full border px-3 py-1.5 text-xs ${
                  active ? "border-cyan text-cyan" : "border-line text-muted"
                }`}
                aria-pressed={active}
              >
                {label}
              </button>
            );
          })}
        </div>
      ) : (
        <p className="mt-3 text-xs text-muted">
          Auto mode selects access-control, injection, browser-safety, secrets, and configuration
          from the repository.
        </p>
      )}

      <label className="mt-4 flex items-center gap-2 text-sm text-muted">
        <input
          type="checkbox"
          checked={skipAnimation}
          onChange={(event) => onSkipAnimationChange(event.target.checked)}
        />
        Skip scan animation
      </label>

      <div className="mt-4 flex flex-wrap gap-3">
        <motion.button
          type="button"
          onClick={onStart}
          disabled={!authorized}
          whileHover={authorized ? { scale: 1.04, boxShadow: "0 0 24px rgba(198,255,77,0.45)" } : undefined}
          whileTap={authorized ? { scale: 0.97 } : undefined}
          transition={{ type: "spring", stiffness: 400, damping: 18 }}
          className="rounded-full bg-lime px-5 py-3 font-semibold text-bg disabled:cursor-not-allowed disabled:opacity-40"
        >
          Start threat scan →
        </motion.button>
        {!demoMode ? (
          <button
            type="button"
            onClick={() => onSourceChange("zip")}
            className="rounded-full border border-line px-5 py-3"
          >
            Choose another source
          </button>
        ) : null}
      </div>
    </section>
  );
}
