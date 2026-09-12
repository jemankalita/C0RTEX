import { extractContext } from "@/server/context/extractContext";
import { getServerEnv } from "@/server/env";
import { enrichWithDemoKnowledge } from "@/server/fallback/enrichFindings";
import { runSpecializedAgents } from "@/server/agents/runAgents";
import { findingsForLenses, selectThreatLenses } from "@/server/lenses";
import { getLLMProvider } from "@/server/llm/provider";
import { loadExistingDemoRepository } from "@/server/repository/loadDemoRepository";
import { scanRepository } from "@/server/scanner/scanRepository";
import { emitScanEvent, getScanRecord } from "@/server/store";
import type { ScanReport } from "@/server/types";

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
    emit("preparing", "Preparing the authorized demo repository.", 8);
    const repository = await loadExistingDemoRepository();
    record.files = repository.files.map((file) => ({ ...file }));

    emit("mapping", "Mapping application structure.", 22);
    const raw = scanRepository(repository);
    emit("detecting", "Deterministic rules finished.", 38, { status: "complete" });

    const selectedLenses =
      record.scanMode === "guided" && record.requestedLenses.length > 0
        ? record.requestedLenses
        : selectThreatLenses(repository, raw);
    const scoped = findingsForLenses(raw, selectedLenses);
    emit("tracing", `Selected lenses: ${selectedLenses.join(", ")}.`, 52);

    const contexts = scoped.map((finding) => extractContext(repository, finding));
    const env = getServerEnv();
    const provider = getLLMProvider();
    record.analysisMode = provider ? "live" : "demo";

    emit("reasoning", "Running selected security lenses.", 64);
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
    const findings = enrichWithDemoKnowledge(scoped, contexts).map((finding) => ({
      ...finding,
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
      limitations: [
        record.analysisMode === "demo"
          ? "Demo analysis mode — live AI reasoning is not configured."
          : "Live analysis used Gemini with repository excerpts only.",
        "This score is a risk-prioritization signal, not a security guarantee.",
        `Selected lenses: ${selectedLenses.join(", ")}.`,
        `Concurrency limit: ${env.concurrency}.`,
      ],
      failedAgents,
      publicRoutes: Number(recon?.extra?.publicRoutes ?? 8),
      authenticatedRoutes: Number(recon?.extra?.authenticatedRoutes ?? 11),
      databaseSinks: Number(recon?.extra?.databaseSinks ?? 7),
      sensitiveOperations: Number(recon?.extra?.sensitiveOperations ?? 5),
    };

    record.findings = findings;
    record.report = report;
    emit("report_ready", "Threat report ready.", 100, { status: "complete" });
  } catch {
    record.error = "The scan could not complete. Retry the scan or use the built-in demo.";
    emit("error", record.error, record.progress, { status: "failed" });
  }
}
