import { extractContext } from "@/server/context/extractContext";
import { getServerEnv } from "@/server/env";
import { enrichWithDemoKnowledge } from "@/server/fallback/enrichFindings";
import { runSpecializedAgents } from "@/server/agents/runAgents";
import { findingsForLenses, selectThreatLenses, THREAT_LENSES } from "@/server/lenses";
import { getLLMProvider } from "@/server/llm/provider";
import { loadExistingDemoRepository } from "@/server/repository/loadDemoRepository";
import { loadGitHubRepository } from "@/server/repository/loadGitHubRepository";
import { scanRepository } from "@/server/scanner/scanRepository";
import { emitScanEvent, getScanRecord } from "@/server/store";
import type { ScanReport } from "@/server/types";

const running = new Set<string>();

export function ensureScanStarted(scanId: string) {
  if (running.has(scanId)) return;
  const record = getScanRecord(scanId);
  if (!record || record.status !== "queued") return;
  running.add(scanId);
  void runSecurityAnalysis(scanId).finally(() => {
    running.delete(scanId);
  });
}

export async function runSecurityAnalysis(scanId: string) {
  const record = getScanRecord(scanId);
  if (!record) return;

  const emit = (
    stage: Parameters<typeof emitScanEvent>[1]["stage"],
    label: string,
    progress: number,
    extra?: Partial<Parameters<typeof emitScanEvent>[1]>,
  ) => {
    emitScanEvent(record, {
      stage,
      label,
      progress,
      status: extra?.status ?? "running",
      detail: extra?.detail,
      agent: extra?.agent,
    });
  };

  try {
    const fromGitHub = record.source === "github" && Boolean(record.githubUrl);
    emit(
      "preparing",
      fromGitHub ? "Fetching the authorized GitHub repository." : "Preparing the authorized demo repository.",
      8,
    );
    const repository = fromGitHub
      ? await loadGitHubRepository(record.githubUrl!)
      : await loadExistingDemoRepository();
    record.files = repository.files.map((file) => ({ ...file }));

    emit("mapping", `Mapping ${repository.name} (${repository.files.length} files).`, 22);
    const raw = scanRepository(repository);
    emit("detecting", `Deterministic rules flagged ${raw.length} candidate(s).`, 38, { status: "complete" });

    const selectedLenses =
      record.scanMode === "guided" && record.requestedLenses.length > 0
        ? record.requestedLenses
        : fromGitHub
          ? [...THREAT_LENSES]
          : selectThreatLenses(repository, raw);
    const scoped = findingsForLenses(raw, selectedLenses);
    emit("tracing", `Selected lenses: ${selectedLenses.join(", ")}.`, 52);

    const contexts = scoped.map((finding) => extractContext(repository, finding));
    const env = getServerEnv();
    const provider = getLLMProvider();
    record.analysisMode = provider ? "live" : "demo";

    emit("reasoning", "Running selected security lenses in parallel.", 64);
    const agents = await runSpecializedAgents({
      repository,
      findings: scoped,
      contexts,
      provider,
      lenses: selectedLenses,
      onAgent: (agent, status) => {
        emit("reasoning", `${agent} ${status}.`, 70, { agent, status });
      },
    });

    emit("synthesizing", "Merging agent results.", 82);
    const failedAgents = agents.filter((agent) => agent.status === "failed").map((agent) => agent.agent);
    const discovered = agents.flatMap((agent) => agent.findings ?? []);
    const mergedRaw = [...scoped];
    for (const finding of discovered) {
      if (mergedRaw.some((item) => item.file === finding.file && item.snippet === finding.snippet)) continue;
      if (!repository.files.some((file) => file.path === finding.file)) continue;
      mergedRaw.push(finding);
    }

    const findings = enrichWithDemoKnowledge(mergedRaw, contexts).map((finding) => ({
      ...finding,
      ruleId: finding.ruleId ?? mergedRaw.find((item) => item.id === finding.id)?.ruleId,
      limitations: [
        ...finding.limitations,
        record.analysisMode === "demo"
          ? "Demo analysis mode — live AI reasoning is not configured."
          : "Live model reasoning used only provided context.",
        "This recheck verifies the selected rule and path. It does not prove that the entire application is secure.",
        ...failedAgents.map((agent) => `${agent} returned a partial or failed result.`),
      ],
    }));

    emit("scoring", "Calculating the safety score.", 90);
    const recon = agents.find((agent) => agent.agent === "recon");
    const report: ScanReport = {
      scanId,
      analysisMode: record.analysisMode,
      scanMode: record.scanMode,
      selectedLenses,
      agents,
      findings,
      repositoryName: repository.name,
      fileCount: repository.files.length,
      limitations: [
        record.analysisMode === "demo"
          ? "Demo analysis mode — live AI reasoning is not configured."
          : "Live analysis used Gemini with repository excerpts only.",
        "This score is a risk-prioritization signal, not a security guarantee.",
        `Selected lenses: ${selectedLenses.join(", ")}.`,
        `Concurrency limit: ${env.concurrency}.`,
        fromGitHub ? `Source: GitHub ${repository.name}.` : "Source: built-in demo repository.",
      ],
      failedAgents,
      publicRoutes: Number(recon?.extra?.publicRoutes ?? Math.max(1, Math.round(repository.files.length / 4))),
      authenticatedRoutes: Number(recon?.extra?.authenticatedRoutes ?? Math.max(1, Math.round(repository.files.length / 3))),
      databaseSinks: Number(recon?.extra?.databaseSinks ?? scoped.filter((item) => item.ruleId.includes("sql")).length),
      sensitiveOperations: Number(recon?.extra?.sensitiveOperations ?? findings.length),
    };

    record.findings = findings;
    record.report = report;
    emit("report_ready", "Threat report ready.", 100, { status: "complete" });
  } catch (error) {
    record.error =
      error instanceof Error
        ? error.message
        : "The scan could not complete. Retry the scan or use the built-in demo.";
    emit("error", record.error, record.progress, { status: "failed" });
  }
}
