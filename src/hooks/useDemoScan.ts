"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createDemoFindings } from "@/data/demoFindings";
import { DEMO_REPOSITORY } from "@/data/demoRepository";
import { applyDemoPatch, recheckFinding, withFindingStatus } from "@/lib/findingState";
import { ERROR_MESSAGES } from "@/lib/errors";
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
  ScanStatus,
  SecurityFinding,
  SourceKind,
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
  const timers = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const selectedFinding = findings.find((finding) => finding.id === selectedFindingId) ?? findings[0];
  const score = scoreFromFindings(findings);
  const counts = countFindingsBySeverity(findings);
  const primaryStatus: FindingStatus =
    findings.find((finding) => finding.id === "missing-object-auth")?.status ?? "OPEN";

  const summary = useMemo(
    () => ({
      score,
      grade: gradeFromScore(score),
      confidence: 89,
      publicRoutes: DEMO_REPOSITORY.publicRoutes,
      authenticatedRoutes: DEMO_REPOSITORY.authenticatedRoutes,
      adminRoutes: DEMO_REPOSITORY.adminRoutes,
      databaseSinks: DEMO_REPOSITORY.databaseSinks,
      externalApiCalls: DEMO_REPOSITORY.externalApiCalls,
      sensitiveOperations: DEMO_REPOSITORY.sensitiveOperations,
      ...counts,
    }),
    [score, counts],
  );

  const startScan = useCallback(() => {
    if (!authorized) return;
    clearTimers();
    setError(null);
    setPatchVisible(false);
    setFindings(createDemoFindings());
    setSelectedFindingId("missing-object-auth");
    setStatus("preparing");
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
        if (stage.id === "report_ready") {
          setToast("Threat report ready");
        }
      }, elapsed);
      timers.current.push(timer);
      elapsed += stage.durationMs;
    });
  }, [authorized, clearTimers, skipAnimation]);

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
  }, [clearTimers]);

  const selectFinding = useCallback((id: string) => {
    setSelectedFindingId(id);
    setPatchVisible(false);
    setGeneratingPatch(false);
    setConfirmingPatch(false);
  }, []);

  const generatePatch = useCallback(() => {
    setGeneratingPatch(true);
    setAnalysisMessage("Preparing remediation.");
    setFindings((current) => withFindingStatus(current, selectedFinding.id, "UNDER_REVIEW"));
    const timer = window.setTimeout(() => {
      setGeneratingPatch(false);
      setPatchVisible(true);
      setStatus((current) => (current === "report_ready" ? "patch_ready" : current));
    }, 700);
    timers.current.push(timer);
  }, [selectedFinding.id]);

  const rejectPatch = useCallback(() => {
    setPatchVisible(false);
    setConfirmingPatch(false);
    setToast("Suggestion rejected. The finding remains open for review.");
  }, []);

  const applyPatch = useCallback(() => {
    const result = applyDemoPatch(findings, selectedFinding.id);
    if ("error" in result) {
      setError("patch_failure");
      setConfirmingPatch(false);
      return;
    }
    setFindings(result.findings);
    setConfirmingPatch(false);
    setToast("Patch applied to temporary demo copy.");
  }, [findings, selectedFinding.id]);

  const runRecheck = useCallback(() => {
    setStatus("rechecking");
    setAnalysisMessage("Validating the suggested change.");
    const timer = window.setTimeout(() => {
      const result = recheckFinding(findings, selectedFinding.id);
      setFindings(result.findings);
      setStatus("resolved");
      setToast("Finding resolved. One demonstrated risky path was resolved.");
    }, 900);
    timers.current.push(timer);
  }, [findings, selectedFinding.id]);

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
    reportReady: status === "report_ready" || status === "patch_ready" || status === "rechecking" || status === "resolved",
    initialScore: INITIAL_SCORE,
  };
}
