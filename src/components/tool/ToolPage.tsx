"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { GrainOverlay } from "@/components/GrainOverlay";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/Reveal";
import { ScanningBeam, SlideIn } from "@/components/motion/SlideIn";
import { RobotStatus } from "@/components/shared/RobotStatus";
import { ApplicationMap } from "@/components/tool/ApplicationMap";
import { AttackPath } from "@/components/tool/AttackPath";
import { AuthorizationNotice } from "@/components/tool/AuthorizationNotice";
import { CodeContext } from "@/components/tool/CodeContext";
import { EvidencePanel } from "@/components/tool/EvidencePanel";
import { FindingDetail } from "@/components/tool/FindingDetail";
import { FindingsList } from "@/components/tool/FindingsList";
import { HowItWorksPanel } from "@/components/tool/HowItWorksPanel";
import { PatchViewer } from "@/components/tool/PatchViewer";
import { RecheckResult } from "@/components/tool/RecheckResult";
import { RepositorySelector } from "@/components/tool/RepositorySelector";
import { SafetyScoreCard } from "@/components/tool/SafetyScoreCard";
import { ScanProgress } from "@/components/tool/ScanProgress";
import { ScanSummaryCard } from "@/components/tool/ScanSummary";
import { ToolNavbar } from "@/components/tool/ToolNavbar";
import { useDemoScan } from "@/hooks/useDemoScan";
import { sortFindings } from "@/lib/findingState";
import { SCAN_STAGES } from "@/lib/scanStages";

const TABS = ["Overview", "Findings", "Attack path", "Patch"] as const;

export function ToolPage() {
  const searchParams = useSearchParams();
  const demoMode = searchParams?.get("demo") === "true";
  const scan = useDemoScan({ demoMode });
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const sorted = useMemo(() => sortFindings(scan.findings), [scan.findings]);
  const stage = SCAN_STAGES.find((item) => item.id === scan.status);
  const robotStatus =
    scan.backendStage === "detecting"
      ? "SCANNING"
      : scan.backendStage === "synthesizing"
        ? "SYNTHESIZING"
        : scan.backendStage === "patching"
          ? "PATCHING"
          : (stage?.robotStatus ??
            (scan.status === "resolved"
              ? "RESOLVED"
              : scan.status === "rechecking"
                ? "RECHECKING"
                : "IDLE"));
  const started = scan.status !== "idle";

  return (
    <div className="relative min-h-screen pb-16">
      <GrainOverlay />
      <ToolNavbar onNewScan={scan.resetScan} />
      <div className="mx-auto max-w-[1440px] space-y-4 px-4 py-4 md:px-6">
        {scan.analysisMode === "demo" && scan.status !== "idle" ? (
          <p className="text-xs text-muted">Demo analysis mode — live AI reasoning is not configured.</p>
        ) : null}
        {scan.selectedLenses.length > 0 ? (
          <p className="text-xs text-muted">Lenses: {scan.selectedLenses.join(", ")}</p>
        ) : null}
        <AnimatePresence>
          {scan.toast ? (
            <motion.p
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-xl border border-lime/30 bg-lime/10 px-4 py-2 text-sm text-lime"
              aria-live="polite"
            >
              {scan.toast}
            </motion.p>
          ) : null}
          {scan.errorMessage ? (
            <motion.p
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-xl border border-threat/40 bg-threat/10 px-4 py-2 text-sm"
              role="alert"
            >
              {scan.errorMessage}
              <button type="button" className="ml-3 underline" onClick={scan.startScan}>
                Run demo fallback
              </button>
            </motion.p>
          ) : null}
        </AnimatePresence>

        <RepositorySelector
          repository={scan.repository}
          source={scan.source}
          onSourceChange={scan.setSource}
          authorized={scan.authorized}
          onStart={scan.startScan}
          demoMode={demoMode}
          skipAnimation={scan.skipAnimation}
          onSkipAnimationChange={scan.setSkipAnimation}
          compact={started}
          scanMode={scan.scanMode}
          onScanModeChange={scan.setScanMode}
          lenses={scan.lenses}
          onLensesChange={scan.setLenses}
        />
        {started ? null : (
          <SlideIn from="left" animateKey={`auth-${started}`}>
            <AuthorizationNotice
              authorized={scan.authorized}
              onChange={scan.setAuthorized}
              demoSelected={scan.source === "demo"}
            />
          </SlideIn>
        )}

        <div className="lg:hidden">
          <SafetyScoreCard
            ready={scan.reportReady}
            score={scan.summary.score}
            grade={scan.summary.grade}
            confidence={scan.summary.confidence}
            categories={scan.categoryScores}
          />
        </div>

        <div className="grid gap-4 lg:hidden">
          <div className="flex gap-2 overflow-x-auto" role="tablist" aria-label="Analyzer views">
            {TABS.map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={tab === item}
                onClick={() => setTab(item)}
                className={`rounded-full px-3 py-2 text-sm ${tab === item ? "bg-cyan text-bg" : "border border-line"}`}
              >
                {item}
              </button>
            ))}
          </div>
          {tab === "Overview" ? (
            <div className="space-y-4">
              <RobotStatus status={robotStatus} compact />
              <ScanProgress status={scan.status} explanation={scan.analysisMessage} />
              {scan.reportReady ? (
                <ApplicationMap summary={scan.summary} resolved={scan.status === "resolved"} />
              ) : null}
              <HowItWorksPanel />
            </div>
          ) : null}
          {tab === "Findings" ? (
            <FindingsList
              findings={sorted}
              selectedId={scan.selectedFinding.id}
              onSelect={(id) => {
                scan.setSelectedFindingId(id);
                setTab("Attack path");
              }}
            />
          ) : null}
          {tab === "Attack path" ? (
            <div className="space-y-4">
              {scan.reportReady ? (
                <>
                  <FindingDetail finding={scan.selectedFinding} />
                  <AttackPath finding={scan.selectedFinding} />
                  <EvidencePanel finding={scan.selectedFinding} />
                </>
              ) : (
                <p className="text-sm text-muted">Start a scan to inspect the attack path.</p>
              )}
            </div>
          ) : null}
          {tab === "Patch" ? (
            <div className="space-y-4">
              {scan.reportReady ? (
                <>
                  <CodeContext finding={scan.selectedFinding} />
                  <PatchViewer
                    finding={scan.selectedFinding}
                    visible={scan.patchVisible}
                    generating={scan.generatingPatch}
                    confirming={scan.confirmingPatch}
                    onGenerate={scan.generatePatch}
                    onConfirmToggle={scan.setConfirmingPatch}
                    onApply={scan.applyPatch}
                    onReject={scan.rejectPatch}
                  />
                  <RecheckResult
                    finding={scan.selectedFinding}
                    score={scan.summary.score}
                    initialScore={scan.initialScore}
                    onRecheck={scan.runRecheck}
                    rechecking={scan.status === "rechecking"}
                  />
                </>
              ) : (
                <p className="text-sm text-muted">Start a scan to generate a reviewable patch.</p>
              )}
            </div>
          ) : null}
        </div>

        <div className="hidden gap-4 lg:grid lg:grid-cols-[280px_minmax(0,1fr)_280px] xl:grid-cols-[300px_minmax(0,1fr)_300px]">
          <aside className="space-y-4">
            <RobotStatus status={robotStatus} compact />
            <ScanProgress status={scan.status} explanation={scan.analysisMessage} />
            {scan.reportReady ? (
              <FindingsList
                findings={sorted}
                selectedId={scan.selectedFinding.id}
                onSelect={scan.setSelectedFindingId}
              />
            ) : null}
            <HowItWorksPanel />
          </aside>

          <section className="space-y-4">
            {scan.scanning ? (
              <SlideIn from="bottom">
                <div className="panel relative overflow-hidden rounded-2xl p-8">
                  <ScanningBeam active />
                  <p className="label text-cyan">
                    <span className="scan-stage-current">{robotStatus}</span>
                  </p>
                  <h2 className="pixel-heading mt-3 text-2xl text-white/90 sm:text-3xl">
                    Here is the attack path taking shape.
                  </h2>
                  <p className="mt-2 text-sm text-muted">{scan.analysisMessage}</p>
                </div>
              </SlideIn>
            ) : null}
            {scan.reportReady ? (
              <StaggerGroup className="space-y-4">
                <StaggerItem>
                  <ScanSummaryCard
                    repositoryName={scan.repository.name}
                    summary={scan.summary}
                    onStartOver={scan.resetScan}
                  />
                </StaggerItem>
                <StaggerItem>
                  <ApplicationMap summary={scan.summary} resolved={scan.status === "resolved"} />
                </StaggerItem>
                <StaggerItem>
                  <FindingDetail finding={scan.selectedFinding} animateKey={scan.selectedFinding.id} />
                </StaggerItem>
                <div className="grid gap-4 xl:grid-cols-2">
                  <StaggerItem>
                    <AttackPath finding={scan.selectedFinding} />
                  </StaggerItem>
                  <StaggerItem>
                    <EvidencePanel finding={scan.selectedFinding} />
                  </StaggerItem>
                </div>
                <div className="grid gap-4 xl:grid-cols-2">
                  <StaggerItem>
                    <CodeContext finding={scan.selectedFinding} animateKey={scan.selectedFinding.id} />
                  </StaggerItem>
                  <StaggerItem>
                    <div className="space-y-4">
                      <PatchViewer
                        finding={scan.selectedFinding}
                        visible={scan.patchVisible}
                        generating={scan.generatingPatch}
                        confirming={scan.confirmingPatch}
                        onGenerate={scan.generatePatch}
                        onConfirmToggle={scan.setConfirmingPatch}
                        onApply={scan.applyPatch}
                        onReject={scan.rejectPatch}
                      />
                      <RecheckResult
                        finding={scan.selectedFinding}
                        score={scan.summary.score}
                        initialScore={scan.initialScore}
                        onRecheck={scan.runRecheck}
                        rechecking={scan.status === "rechecking"}
                      />
                    </div>
                  </StaggerItem>
                </div>
              </StaggerGroup>
            ) : scan.scanning ? null : (
              <Reveal>
                <div className="panel rounded-2xl p-8 text-muted">
                  Confirm authorization, then start a threat scan to map the attack surface.
                </div>
              </Reveal>
            )}
          </section>

          <aside className="space-y-4">
            <SafetyScoreCard
              ready={scan.reportReady}
              score={scan.summary.score}
              grade={scan.summary.grade}
              confidence={scan.summary.confidence}
              categories={scan.categoryScores}
            />
          </aside>
        </div>

        <footer id="safety-note" className="rounded-2xl border border-line px-4 py-4 text-sm text-muted">
          C0RTEX is for authorized defensive analysis only. Do not scan systems you do not own or
          have permission to test. This score and these findings are a prioritization signal, not a
          security guarantee.
        </footer>
      </div>
    </div>
  );
}
