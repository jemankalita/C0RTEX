import type { SecurityFinding } from "@/types/security";

export type BackendStage =
  | "preparing"
  | "mapping"
  | "detecting"
  | "tracing"
  | "reasoning"
  | "synthesizing"
  | "scoring"
  | "report_ready"
  | "patching"
  | "rechecking"
  | "resolved"
  | "error";

export type BackendProgress = {
  scanId: string;
  stage: BackendStage;
  label: string;
  detail?: string;
  progress: number;
  agent?: string;
  status: "pending" | "running" | "complete" | "partial" | "failed";
};

export function toUiStatus(stage: BackendStage) {
  if (stage === "detecting") return "tracing" as const;
  if (stage === "synthesizing") return "reasoning" as const;
  if (stage === "patching") return "patch_ready" as const;
  return stage;
}

async function readJson<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(payload.error ?? "Request failed.");
  }
  return payload;
}

export async function createScan(
  authorized: boolean,
  mode: "auto" | "guided" = "auto",
  lenses: string[] = [],
) {
  return readJson<{ scanId: string; status: string }>(
    await fetch("/api/scans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "demo",
        repositoryId: "existing-demo",
        authorized,
        mode,
        lenses,
      }),
    }),
  );
}

export async function getScan(scanId: string) {
  return readJson<{ scanId: string; status: string; progress: number; analysisMode: "demo" | "live"; error: string | null }>(
    await fetch(`/api/scans/${scanId}`),
  );
}

export async function getReport(scanId: string) {
  return readJson<{
    scanId: string;
    analysisMode: "demo" | "live";
    scanMode: "auto" | "guided";
    selectedLenses: string[];
    findings: SecurityFinding[];
    publicRoutes: number;
    authenticatedRoutes: number;
    databaseSinks: number;
    sensitiveOperations: number;
    limitations: string[];
  }>(await fetch(`/api/scans/${scanId}/report`));
}

export function subscribeScanEvents(scanId: string, onEvent: (event: BackendProgress) => void) {
  const source = new EventSource(`/api/scans/${scanId}/events`);
  source.onmessage = (message) => {
    onEvent(JSON.parse(message.data) as BackendProgress);
  };
  return () => source.close();
}

export async function requestPatch(scanId: string, findingId: string) {
  return readJson<{ finding: SecurityFinding }>(
    await fetch(`/api/scans/${scanId}/findings/${findingId}/patch`, { method: "POST" }),
  );
}

export async function applyPatch(scanId: string, findingId: string) {
  return readJson<{ findings: SecurityFinding[] }>(
    await fetch(`/api/scans/${scanId}/findings/${findingId}/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmed: true }),
    }),
  );
}

export async function recheckFinding(scanId: string, findingId: string) {
  return readJson<{ findings: SecurityFinding[]; resolved: boolean; message: string }>(
    await fetch(`/api/scans/${scanId}/findings/${findingId}/recheck`, { method: "POST" }),
  );
}
