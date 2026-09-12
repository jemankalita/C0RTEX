"use client";

import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/Reveal";
import { ScrambleText } from "@/components/motion/Scramble";
import type { SecurityFinding } from "@/types/security";

export function FindingDetail({ finding, animateKey }: { finding: SecurityFinding; animateKey?: string }) {
  return (
    <StaggerGroup key={animateKey} as="article" className="panel hud-panel rounded-2xl p-5">
      <StaggerItem>
        <p className="font-mono text-xs text-threat">
          <ScrambleText text={finding.severity} duration={700} />
        </p>
        <h2 className="pixel-heading mt-1 text-2xl text-white/90">{finding.title}</h2>
        <p className="mt-2 text-sm text-muted">{finding.category}</p>
        <p className="font-mono text-sm text-cyan">
          {finding.file}:{finding.line}
        </p>
      </StaggerItem>
      <StaggerItem>
        <dl className="mt-4 grid gap-2 text-sm md:grid-cols-3">
          <div>
            <dt className="text-muted">Confidence</dt>
            <dd>{finding.confidence}%</dd>
          </div>
          <div>
            <dt className="text-muted">Reachability</dt>
            <dd>{finding.reachability}</dd>
          </div>
          <div>
            <dt className="text-muted">Safety-score impact</dt>
            <dd>{finding.scoreImpact} points</dd>
          </div>
        </dl>
      </StaggerItem>
      <p className="font-mono text-xs text-threat">{finding.severity}</p>
      <h2 className="mt-1 text-2xl font-semibold">{finding.title}</h2>
      <p className="mt-2 text-sm text-muted">{finding.category}</p>
      <p className="font-mono text-sm text-cyan">
        {finding.file}:{finding.line}
      </p>
      <dl className="mt-4 grid gap-2 text-sm md:grid-cols-3">
        <div>
          <dt className="text-muted">Confidence</dt>
          <dd>{finding.confidence}%</dd>
        </div>
        <div>
          <dt className="text-muted">Reachability</dt>
          <dd>{finding.reachability}</dd>
        </div>
        <div>
          <dt className="text-muted">Safety-score impact</dt>
          <dd>{finding.scoreImpact} points</dd>
        </div>
      </dl>
      <StaggerItem>
        <section className="mt-5">
          <h3 className="text-sm font-semibold">Why this matters</h3>
          <p className="mt-2 text-sm text-muted">{finding.whyItMatters}</p>
        </section>
      </StaggerItem>
      <StaggerItem>
        <section className="mt-5">
          <h3 className="text-sm font-semibold">Attacker story</h3>
          <p className="mt-2 text-sm text-muted">{finding.attackerStory}</p>
        </section>
      </StaggerItem>
      <StaggerItem>
        <section className="mt-5">
          <h3 className="text-sm font-semibold">Suggested fix</h3>
          <p className="mt-2 text-sm text-muted">
            {finding.patchExplanation ?? "Generate a suggested fix to review a minimal patch."}
          </p>
        </section>
      </StaggerItem>
      <StaggerItem>
        <section className="mt-5">
          <h3 className="text-sm font-semibold">Limitations</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
            {finding.limitations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </StaggerItem>
    </StaggerGroup>
  );
}
