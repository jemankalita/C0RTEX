import { extractContext } from "@/server/context/extractContext";
import { getServerEnv } from "@/server/env";
import { enrichWithDemoKnowledge } from "@/server/fallback/enrichFindings";
import { runSpecializedAgents } from "@/server/agents/runAgents";
import { getLLMProvider } from "@/server/llm/provider";
import { loadDemoRepository } from "@/server/repository/loadDemoRepository";
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
    const repository = await loadDemoRepository();
    record.files = repository.files.map((file) => ({ ...file }));

    emit("mapping", "Mapping application structure.", 22);
    const raw = scanRepository(repository);
    emit("detecting", "Deterministic rules finished.", 38, { status: "complete" });

    const contexts = raw.map((finding) => extractContext(repository, finding));
    emit("tracing", "Collected source-to-sink context.", 52);

    const env = getServerEnv();
    const provider = getLLMProvider();
    record.analysisMode = provider ? "live" : "demo";

    emit("reasoning", "Specialized agents are reviewing context.", 64);
    const agents = await runSpecializedAgents({
      repository,
      findings: raw,
      contexts,
      provider,
      onAgent: (agent, status) => {
        emit("reasoning", `${agent} ${status}.`, 70, { agent, status });
      },
    });

    emit("synthesizing", "Merging agent results.", 82);
    const failedAgents = agents.filter((agent) => agent.status === "failed").map((agent) => agent.agent);
    const findings = enrichWithDemoKnowledge(raw, contexts).map((finding) => ({
      ...finding,
      limitations: [
        ...finding.limitations,
        record.analysisMode === "demo" ? "Demo analysis mode." : "Live model reasoning used only provided context.",
        ...failedAgents.map((agent) => `${agent} returned a partial or failed result.`),
      ],
    }));

    emit("scoring", "Calculating the safety score.", 90);
    const recon = agents.find((agent) => agent.agent === "recon");
    const report: ScanReport = {
      scanId,
      analysisMode: record.analysisMode,
      findings,
      limitations: [
        record.analysisMode === "demo"
          ? "Demo analysis mode. Live model reasoning did not run."
          : "Live analysis used Gemini with repository excerpts only.",
        "This score is a risk-prioritization signal, not a security guarantee.",
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
