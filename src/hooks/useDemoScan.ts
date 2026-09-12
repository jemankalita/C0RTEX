"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createDemoFindings } from "@/data/demoFindings";
import { DEMO_REPOSITORY } from "@/data/demoRepository";
import { applyDemoPatch, recheckFinding, withFindingStatus } from "@/lib/findingState";
import { ERROR_MESSAGES } from "@/lib/errors";
import {
  applyPatch as applyRemotePatch,
  createScan,
  getReport,
  getScan,
  recheckFinding as recheckRemoteFinding,
  requestPatch,
  subscribeScanEvents,
  toUiStatus,
} from "@/lib/scanClient";
import { SCAN_STAGES, isScanning } from "@/lib/scanStages";
import {
  categoryScoresFromStatus,
  countFindingsBySeverity,
  gradeFromScore,
  INITIAL_SCORE,
  scoreFromFindings,
} from "@/lib/score";
import type {
  FindingStatus,
  ScanErrorKind,
  ScanMode,
  ScanStatus,
  SecurityFinding,
  SourceKind,
  ThreatLens,
} from "@/types/security";

const ANALYSIS_MESSAGES = [
  "Inspecting route surface.",
  "Connecting inputs to sinks.",
  "Checking authorization boundaries.",
  "Estimating exposure.",
  "Comparing relevant context.",
  "Preparing remediation.",
  "Validating the suggested change.",
];

type UseDemoScanOptions = {
  demoMode: boolean;
};

export function useDemoScan({ demoMode }: UseDemoScanOptions) {
  const [source, setSource] = useState<SourceKind>("demo");
  const [authorized, setAuthorized] = useState(demoMode);
  const [status, setStatus] = useState<ScanStatus>("idle");
  const [skipAnimation, setSkipAnimation] = useState(false);
  const [findings, setFindings] = useState<SecurityFinding[]>(() => createDemoFindings());
  const [selectedFindingId, setSelectedFindingId] = useState("missing-object-auth");
  const [patchVisible, setPatchVisible] = useState(false);
  const [generatingPatch, setGeneratingPatch] = useState(false);
  const [confirmingPatch, setConfirmingPatch] = useState(false);
  const [error, setError] = useState<ScanErrorKind | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [analysisMessage, setAnalysisMessage] = useState(ANALYSIS_MESSAGES[0]);
  const [scanId, setScanId] = useState<string | null>(null);
  const [analysisMode, setAnalysisMode] = useState<"demo" | "live">("demo");
  const [scanMode, setScanMode] = useState<ScanMode>("auto");
  const [lenses, setLenses] = useState<ThreatLens[]>([]);
  const [selectedLenses, setSelectedLenses] = useState<string[]>([]);
  const [backendStage, setBackendStage] = useState<string>("idle");
  const [surface, setSurface] = useState({
    publicRoutes: DEMO_REPOSITORY.publicRoutes,
    authenticatedRoutes: DEMO_REPOSITORY.authenticatedRoutes,
    databaseSinks: DEMO_REPOSITORY.databaseSinks,
    sensitiveOperations: DEMO_REPOSITORY.sensitiveOperations,
  });
  const timers = useRef<number[]>([]);
  const stopEvents = useRef<(() => void) | null>(null);
  const reportLoaded = useRef(false);

  const clearTimers = useCallback(() => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
    stopEvents.current?.();
    stopEvents.current = null;
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const selectedFinding = findings.find((finding) => finding.id === selectedFindingId) ?? findings[0];
  const score = scoreFromFindings(findings);
  const counts = countFindingsBySeverity(findings);
  const primaryStatus: FindingStatus =
    findings.find((finding) => isPrimaryAuthorizationFinding(finding))?.status ?? "OPEN";

  const summary = useMemo(
    () => ({
      score,
      grade: gradeFromScore(score),
      confidence: 89,
      publicRoutes: surface.publicRoutes,
      authenticatedRoutes: surface.authenticatedRoutes,
      adminRoutes: DEMO_REPOSITORY.adminRoutes,
      databaseSinks: surface.databaseSinks,
      externalApiCalls: DEMO_REPOSITORY.externalApiCalls,
      sensitiveOperations: surface.sensitiveOperations,
      ...counts,
    }),
    [score, counts, surface],
  );

  const loadReport = useCallback(async (id: string) => {
    const report = await getReport(id);
    setFindings(report.findings);
    setAnalysisMode(report.analysisMode);
    setSelectedLenses(report.selectedLenses ?? []);
    setSurface({
      publicRoutes: report.publicRoutes,
      authenticatedRoutes: report.authenticatedRoutes,
      databaseSinks: report.databaseSinks,
      sensitiveOperations: report.sensitiveOperations,
    });
    setSelectedFindingId(report.findings[0]?.id ?? "missing-object-auth");
    setStatus("report_ready");
    setToast("Threat report ready");
  }, []);

  const startLocalFallback = useCallback(() => {
    setFindings(createDemoFindings());
    setSelectedFindingId("missing-object-auth");
    setStatus("preparing");
    setAnalysisMode("demo");
    setAnalysisMessage(ANALYSIS_MESSAGES[0]);
    if (skipAnimation) {
      setStatus("report_ready");
      setToast("Threat report ready");
      return;
    }
    let elapsed = SCAN_STAGES[0].durationMs;
    SCAN_STAGES.slice(1).forEach((stage, index) => {
      const timer = window.setTimeout(() => {
        setStatus(stage.id);
        setAnalysisMessage(ANALYSIS_MESSAGES[Math.min(index + 1, ANALYSIS_MESSAGES.length - 1)]);
        if (stage.id === "report_ready") setToast("Threat report ready");
      }, elapsed);
      timers.current.push(timer);
      elapsed += stage.durationMs;
    });
  }, [skipAnimation]);

  const startScan = useCallback(async () => {
    if (!authorized) return;
    clearTimers();
    setError(null);
    setPatchVisible(false);
    setStatus("preparing");
    setAnalysisMessage(ANALYSIS_MESSAGES[0]);
    reportLoaded.current = false;

    try {
      const created = await createScan(true, scanMode, lenses);
      setScanId(created.scanId);

      if (skipAnimation) {
        for (let attempt = 0; attempt < 20; attempt += 1) {
          const current = await getScan(created.scanId);
          if (current.status === "report_ready") {
            await loadReport(created.scanId);
            return;
          }
          if (current.status === "error") throw new Error(current.error ?? "Scan failed.");
          await new Promise((resolve) => window.setTimeout(resolve, 250));
        }
      }

      stopEvents.current = subscribeScanEvents(created.scanId, (event) => {
        setBackendStage(event.stage);
        setStatus(toUiStatus(event.stage));
        setAnalysisMessage(event.detail ?? event.label);
        if (event.stage === "report_ready" && !reportLoaded.current) {
          reportLoaded.current = true;
          void loadReport(created.scanId);
        }
        if (event.stage === "error") {
          setError("scan_failure");
        }
      });
    } catch {
      startLocalFallback();
    }
  }, [authorized, clearTimers, lenses, loadReport, scanMode, skipAnimation, startLocalFallback]);

  const resetScan = useCallback(() => {
    clearTimers();
    setStatus("idle");
    setFindings(createDemoFindings());
    setSelectedFindingId("missing-object-auth");
    setPatchVisible(false);
    setGeneratingPatch(false);
    setConfirmingPatch(false);
    setError(null);
    setToast(null);
    setSource("demo");
    setScanId(null);
    setAnalysisMode("demo");
    reportLoaded.current = false;
  }, [clearTimers]);

  const selectFinding = useCallback((id: string) => {
    setSelectedFindingId(id);
    setPatchVisible(false);
    setGeneratingPatch(false);
    setConfirmingPatch(false);
  }, []);

  const generatePatch = useCallback(async () => {
    setGeneratingPatch(true);
    setAnalysisMessage("Preparing remediation.");
    setFindings((current) => withFindingStatus(current, selectedFinding.id, "UNDER_REVIEW"));
    try {
      if (scanId) {
        const result = await requestPatch(scanId, selectedFinding.id);
        setFindings((current) =>
          current.map((finding) => (finding.id === result.finding.id ? result.finding : finding)),
        );
      }
      setPatchVisible(true);
      setStatus((current) => (current === "report_ready" ? "patch_ready" : current));
    } catch {
      setError("missing_context");
    } finally {
      setGeneratingPatch(false);
    }
  }, [scanId, selectedFinding.id]);

  const rejectPatch = useCallback(() => {
    setPatchVisible(false);
    setConfirmingPatch(false);
    setToast("Suggestion rejected. The finding remains open for review.");
  }, []);

  const applyPatch = useCallback(async () => {
    try {
      if (scanId) {
        const result = await applyRemotePatch(scanId, selectedFinding.id);
        setFindings(result.findings);
      } else {
        const result = applyDemoPatch(findings, selectedFinding.id);
        if ("error" in result) {
          setError("patch_failure");
          setConfirmingPatch(false);
          return;
        }
        setFindings(result.findings);
      }
      setConfirmingPatch(false);
      setToast("Patch applied to temporary demo copy.");
    } catch {
      setError("patch_failure");
      setConfirmingPatch(false);
    }
  }, [findings, scanId, selectedFinding.id]);

  const runRecheck = useCallback(async () => {
    setStatus("rechecking");
    setAnalysisMessage("Validating the suggested change.");
    try {
      if (scanId) {
        const result = await recheckRemoteFinding(scanId, selectedFinding.id);
        setFindings(result.findings);
        setStatus(result.resolved ? "resolved" : "patch_ready");
        setToast(result.message);
        return;
      }
      const result = recheckFinding(findings, selectedFinding.id);
      setFindings(result.findings);
      setStatus("resolved");
      setToast("Finding resolved. Only the selected path was rechecked.");
    } catch {
      setError("scan_failure");
    }
  }, [findings, scanId, selectedFinding.id]);

  return {
    repository: DEMO_REPOSITORY,
    source,
    setSource,
    authorized,
    setAuthorized,
    status,
    skipAnimation,
    setSkipAnimation,
    findings,
    selectedFinding,
    setSelectedFindingId: selectFinding,
    rejectPatch,
    patchVisible,
    generatingPatch,
    confirmingPatch,
    setConfirmingPatch,
    error,
    errorMessage: error ? ERROR_MESSAGES[error] : null,
    toast,
    setToast,
    analysisMessage,
    summary,
    categoryScores: categoryScoresFromStatus(primaryStatus),
    scanning: isScanning(status),
    startScan,
    resetScan,
    generatePatch,
    applyPatch,
    runRecheck,
    reportReady:
      status === "report_ready" || status === "patch_ready" || status === "rechecking" || status === "resolved",
    initialScore: INITIAL_SCORE,
    analysisMode,
    scanId,
    scanMode,
    setScanMode,
    lenses,
    setLenses,
    selectedLenses,
    backendStage,
  };
}
