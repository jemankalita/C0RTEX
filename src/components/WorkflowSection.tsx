"use client";

import { useEffect, useRef, useState } from "react";
import { AttackPathGraph } from "@/components/AttackPathGraph";
import { CountUp } from "@/components/motion/CountUp";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/Reveal";
import { ScrambleText } from "@/components/motion/Scramble";
import { useRobot } from "@/components/RobotContext";
import { DEMO_ATTACK_SURFACE, getPrimaryFinding } from "@/data/demoFindings";
import { WORKFLOW_FLOW, WORKFLOW_STEPS, type WorkflowStage } from "@/data/workflowSteps";

export function WorkflowSection() {
  const { setStatus } = useRobot();
  const [active, setActive] = useState<WorkflowStage>("MAP");
  const stepRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const step = WORKFLOW_STEPS.find((item) => item.id === active);
    if (step) setStatus(step.robotStatus);
  }, [active, setStatus]);

  useEffect(() => {
    const nodes = WORKFLOW_STEPS
      .map((step) => stepRefs.current[step.id])
      .filter((node): node is HTMLElement => Boolean(node));
    const observer = new IntersectionObserver(
      (entries) => {
        const top = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const id = top?.target.getAttribute("data-stage") as WorkflowStage | null;
        if (id) setActive(id);
      },
      { threshold: 0.45, rootMargin: "-20% 0px -35% 0px" },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const current = WORKFLOW_STEPS.find((step) => step.id === active) ?? WORKFLOW_STEPS[0];
  const primary = getPrimaryFinding();

  return (
    <section id="how-it-works" className="border-t border-line py-24">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal>
          <p className="bracket">
            <ScrambleText text="[ agent ]" />
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="display mt-4 max-w-2xl text-4xl leading-[1.02] sm:text-6xl">
            How C0RTEX reviews a codebase.
          </h2>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="mt-4 text-sm text-muted">{WORKFLOW_FLOW.join(" → ")}</p>
        </Reveal>

        <div className="mt-12 grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-[11px] uppercase tracking-[0.2em] text-cyan">Current stage</p>
            <p className="mt-2 text-3xl font-semibold">{current.number} — {current.title}</p>
            <p className="mt-3 text-sm leading-6 text-muted">{current.description}</p>
            <ol className="mt-6 space-y-2">
              {WORKFLOW_STEPS.map((step) => (
                <li key={step.id}>
                  <button
                    type="button"
                    className={`w-full rounded-full px-4 py-2 text-left text-sm ${
                      step.id === active ? "bg-lime text-bg" : "btn-ghost text-muted"
                    }`}
                    onClick={() => {
                      setActive(step.id);
                      stepRefs.current[step.id]?.scrollIntoView({ behavior: "smooth", block: "center" });
                    }}
                  >
                    {step.number} {step.title}
                  </button>
                </li>
              ))}
            </ol>
            <div className="mt-6 h-1 overflow-hidden rounded-full bg-elevated" aria-hidden="true">
              <div
                className="h-full bg-lime"
                style={{ width: `${((WORKFLOW_STEPS.findIndex((step) => step.id === active) + 1) / 5) * 100}%` }}
              />
            </div>
          </div>

          <StaggerGroup className="space-y-8">
            {WORKFLOW_STEPS.map((step) => (
              <StaggerItem key={step.id}>
              <article
                ref={(node) => {
                  stepRefs.current[step.id] = node;
                }}
                data-stage={step.id}
                className="panel rounded-2xl p-6"
              >
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted">{step.number} {step.title}</p>
                <p className="mt-3 text-sm text-muted">{step.caption}</p>
                <div className="mt-5">
                  {step.id === "MAP" ? (
                    <dl className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-elevated p-4">
                        <dt className="text-xs text-muted">Public routes</dt>
                        <dd className="text-2xl text-cyan">
                          <CountUp to={DEMO_ATTACK_SURFACE.publicRoutes} />
                        </dd>
                      </div>
                      <div className="rounded-2xl bg-elevated p-4">
                        <dt className="text-xs text-muted">Authenticated routes</dt>
                        <dd className="text-2xl">
                          <CountUp to={DEMO_ATTACK_SURFACE.authenticatedRoutes} />
                        </dd>
                      </div>
                      <div className="rounded-2xl bg-elevated p-4">
                        <dt className="text-xs text-muted">Database sinks</dt>
                        <dd className="text-2xl text-amber">
                          <CountUp to={DEMO_ATTACK_SURFACE.databaseSinks} />
                        </dd>
                      </div>
                      <div className="rounded-2xl bg-elevated p-4">
                        <dt className="text-xs text-muted">Sensitive operations</dt>
                        <dd className="text-2xl text-threat">
                          <CountUp to={DEMO_ATTACK_SURFACE.sensitiveOperations} />
                        </dd>
                      </div>
                    </dl>
                  ) : null}
                  {step.id === "TRACE" ? (
                    <pre data-cursor="inspect" className="overflow-x-auto font-mono text-xs leading-7 text-cyan">
                      {`GET /api/orders/:id
↓
req.params.id
↓
Order.findById(id)
↓
Order returned without ownership check`}
                    </pre>
                  ) : null}
                  {step.id === "EXPLAIN" ? (
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-threat">High — broken access control</p>
                      <p className="mt-3 text-sm leading-6">{primary.story}</p>
                      <p className="mt-4 text-sm text-muted">Confidence: 93%</p>
                      <p className="text-sm text-muted">Reachability: Authenticated route</p>
                    </div>
                  ) : null}
                  {step.id === "FIX" ? (
                    <pre data-cursor="inspect" className="overflow-x-auto font-mono text-xs leading-6">
                      <span className="text-threat">- Order.findById(req.params.id)</span>
                      {"\n"}
                      <span className="text-lime">{`+ Order.findOne({
+   _id: req.params.id,
+   userId: req.user.id
+ })`}</span>
                    </pre>
                  ) : null}
                  {step.id === "RECHECK" ? (
                    <div className="space-y-4">
                      <p className="text-sm">Finding: <span className="text-lime">RESOLVED</span></p>
                      <p className="text-sm">Safety score: 64 → 86</p>
                      <p className="text-sm">Attack path: <span className="text-lime">BROKEN</span></p>
                      <AttackPathGraph resolved />
                    </div>
                  ) : null}
                </div>
              </article>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </div>
    </section>
  );
}
