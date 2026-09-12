"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createDemoFindings } from "@/data/demoFindings";
import { DEMO_REPOSITORY } from "@/data/demoRepository";
import { applyDemoPatch, recheckFinding } from "@/lib/findingState";
import { activeFindingId, resolveSelectedFinding } from "@/lib/selectFinding";
import { ERROR_MESSAGES } from "@/lib/errors";
import {
  applyPatch as applyRemotePatch,
  createScan,
  downloadTextFile,
  getPatchedFiles,
  getReport,
  getScan,
  recheckFinding as recheckRemoteFinding,
  requestPatch,
  subscribeScanEvents,
  toUiStatus,
  type BackendProgress,
} from "@/lib/scanClient";
import { SCAN_STAGES, isScanning } from "@/lib/scanStages";
import {
  categoryScoresFromFindings,
  countFindingsBySeverity,
  gradeFromScore,
  scanConfidenceFromFindings,
  scoreFromFindings,
} from "@/lib/score";
import { suggestPatch } from "@/lib/suggestPatch";
import type {
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
  const [githubUrl, setGithubUrl] = useState("");
  const [repository, setRepository] = useState(DEMO_REPOSITORY);
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
  const [baselineScore, setBaselineScore] = useState<number | null>(null);
  const [patchedFile, setPatchedFile] = useState<{ path: string; content: string } | null>(null);
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

  const selectedFinding = resolveSelectedFinding(findings, selectedFindingId);
  const selectedId = activeFindingId(selectedFinding);

  useEffect(() => {
    if (findings.length === 0) {
      if (selectedFindingId !== "") {
        setSelectedFindingId("");
      }
      return;
    }
    if (!findings.some((finding) => finding.id === selectedFindingId)) {
      setSelectedFindingId(findings[0].id);
    }
  }, [findings, selectedFindingId]);
  const score = scoreFromFindings(findings);
  const counts = countFindingsBySeverity(findings);

  const summary = useMemo(
    () => ({
      score,
      grade: gradeFromScore(score),
      confidence: scanConfidenceFromFindings(findings),
      publicRoutes: surface.publicRoutes,
      authenticatedRoutes: surface.authenticatedRoutes,
      adminRoutes: DEMO_REPOSITORY.adminRoutes,
      databaseSinks: surface.databaseSinks,
      externalApiCalls: DEMO_REPOSITORY.externalApiCalls,
      sensitiveOperations: surface.sensitiveOperations,
      ...counts,
    }),
    [score, counts, findings, surface],
  );

  const loadReport = useCallback(async (id: string) => {
    const report = await getReport(id);
    setFindings(report.findings ?? []);
    setAnalysisMode(report.analysisMode);
    setSelectedLenses(report.selectedLenses ?? []);
    if (report.repositoryName) {
      setRepository((current) => ({
        ...current,
        name: report.repositoryName!,
        files: report.fileCount ?? current.files,
        description: source === "github" ? githubUrl : current.description,
      }));
    }
    setSurface({
      publicRoutes: report.publicRoutes,
      authenticatedRoutes: report.authenticatedRoutes,
      databaseSinks: report.databaseSinks,
      sensitiveOperations: report.sensitiveOperations,
    });
    setSelectedFindingId(report.findings[0]?.id ?? "");
    setBaselineScore(scoreFromFindings(report.findings ?? []));
    setPatchedFile(null);
    setStatus("report_ready");
    setToast("Threat report ready");
  }, [githubUrl, source]);

  const startLocalFallback = useCallback(() => {
    const localFindings = createDemoFindings();
    setFindings(localFindings);
    setSelectedFindingId(localFindings[0]?.id ?? "");
    setBaselineScore(scoreFromFindings(localFindings));
    setPatchedFile(null);
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
      const created = await createScan(
        true,
        scanMode,
        lenses,
        source === "github" ? "github" : "demo",
        source === "github" ? githubUrl : undefined,
      );
      setScanId(created.scanId);

      if (source === "github") {
        setRepository((current) => ({
          ...current,
          name: githubUrl.replace("https://github.com/", ""),
          description: githubUrl,
        }));
      }

      if (skipAnimation) {
        for (let attempt = 0; attempt < 40; attempt += 1) {
          const current = await getScan(created.scanId);
          if (current.status === "report_ready") {
            await loadReport(created.scanId);
            return;
          }
          if (current.status === "error") throw new Error(current.error ?? "Scan failed.");
          await new Promise((resolve) => window.setTimeout(resolve, 400));
        }
      }

      const queue: BackendProgress[] = [];
      let draining = false;
      let lastUiStatus = "";

      const applyEvent = (event: BackendProgress) => {
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
      };

      const drain = async () => {
        if (draining) return;
        draining = true;
        while (queue.length > 0) {
          const event = queue.shift();
          if (!event) break;
          const uiStatus = toUiStatus(event.stage);
          const stageChanged = uiStatus !== lastUiStatus;
          lastUiStatus = uiStatus;
          applyEvent(event);
          if (!skipAnimation && stageChanged && event.stage !== "error") {
            await new Promise((resolve) => window.setTimeout(resolve, 1400));
          }
        }
        draining = false;
      };

      stopEvents.current = subscribeScanEvents(created.scanId, (event) => {
        queue.push(event);
        void drain();
      });
    } catch {
      if (source === "github") {
        setError("scan_failure");
        setStatus("error");
        return;
      }
      startLocalFallback();
    }
  }, [authorized, clearTimers, githubUrl, lenses, loadReport, scanMode, skipAnimation, source, startLocalFallback]);

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
    setGithubUrl("");
    setRepository(DEMO_REPOSITORY);
    setScanId(null);
    setAnalysisMode("demo");
    setBaselineScore(null);
    setPatchedFile(null);
    reportLoaded.current = false;
  }, [clearTimers]);

  const selectFinding = useCallback((id: string) => {
    setSelectedFindingId(id);
    setPatchVisible(false);
    setGeneratingPatch(false);
    setConfirmingPatch(false);
  }, []);

  const generatePatch = useCallback(async () => {
    if (!selectedId) return;
    setGeneratingPatch(true);
    setAnalysisMessage("Preparing remediation.");
    setFindings((current) =>
      current.map((finding) => {
        if (finding.id !== selectedId) return finding;
        const suggestion = suggestPatch(finding);
        return {
          ...finding,
          status: "UNDER_REVIEW" as const,
          patch: suggestion.patch,
          patchExplanation: suggestion.patchExplanation,
        };
      }),
    );
    try {
      if (scanId) {
        const result = await requestPatch(scanId, selectedId);
        if (result.finding) {
          setFindings((current) =>
            current.map((finding) => (finding.id === result.finding.id ? result.finding : finding)),
          );
        }
      }
      setPatchVisible(true);
      setStatus((current) => (current === "report_ready" ? "patch_ready" : current));
    } catch {
      setError("missing_context");
    } finally {
      setGeneratingPatch(false);
    }
  }, [scanId, selectedId]);

  const rejectPatch = useCallback(() => {
    setPatchVisible(false);
    setConfirmingPatch(false);
    setToast("Suggestion rejected. The finding remains open for review.");
  }, []);

  const applyPatch = useCallback(async () => {
    if (!selectedId) return;
    try {
      if (scanId) {
        const result = await applyRemotePatch(scanId, selectedId);
        setFindings(result.findings ?? []);
        if (result.patchedFile) {
          setPatchedFile(result.patchedFile);
        }
      } else {
        const result = applyDemoPatch(findings, selectedId);
        if ("error" in result) {
          setError("patch_failure");
          setConfirmingPatch(false);
          return;
        }
        setFindings(result.findings);
        const target = result.findings.find((finding) => finding.id === selectedId);
        if (target?.patch) {
          setPatchedFile({ path: `${target.file}.diff`, content: target.patch });
        }
      }
      setConfirmingPatch(false);
      setToast("Patch applied to the scan working copy. Download it to update the real repository.");
    } catch {
      setError("patch_failure");
      setConfirmingPatch(false);
    }
  }, [findings, scanId, selectedId]);

  const downloadPatchedFile = useCallback(() => {
    if (!patchedFile && !selectedFinding?.patch) return;
    const path = patchedFile?.path ?? selectedFinding?.file ?? "fix.diff";
    const content = patchedFile?.content ?? selectedFinding?.patch ?? "";
    downloadTextFile(path.replaceAll("/", "__"), content);
  }, [patchedFile, selectedFinding]);

  const downloadAllPatchedFiles = useCallback(async () => {
    if (scanId) {
      const result = await getPatchedFiles(scanId);
      if (result.files.length === 0) {
        downloadPatchedFile();
        return;
      }
      const bundle = result.files
        .map((file) => `--- ${file.path}\n${file.content}`)
        .join("\n\n");
      downloadTextFile("c0rtex-patched-files.txt", bundle);
      return;
    }
    downloadPatchedFile();
  }, [downloadPatchedFile, scanId]);

  const runRecheck = useCallback(async () => {
    if (!selectedId) return;
    setStatus("rechecking");
    setAnalysisMessage("Validating the suggested change.");
    try {
      if (scanId) {
        const result = await recheckRemoteFinding(scanId, selectedId);
        setFindings(result.findings ?? []);
        setStatus(result.resolved ? "resolved" : "patch_ready");
        setToast(result.message);
        return;
      }
      const result = recheckFinding(findings, selectedId);
      setFindings(result.findings);
      setStatus("resolved");
      setToast("Finding resolved. Only the selected path was rechecked.");
    } catch {
      setError("scan_failure");
    }
  }, [findings, scanId, selectedId]);

  return {
    repository,
    source,
    setSource,
    githubUrl,
    setGithubUrl,
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
    categoryScores: categoryScoresFromFindings(findings),
    scanning: isScanning(status),
    startScan,
    resetScan,
    generatePatch,
    applyPatch,
    downloadPatchedFile,
    downloadAllPatchedFiles,
    patchedFile,
    runRecheck,
    reportReady:
      status === "report_ready" || status === "patch_ready" || status === "rechecking" || status === "resolved",
    initialScore: baselineScore ?? score,
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
