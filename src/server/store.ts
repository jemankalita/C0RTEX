import type { SecurityFinding } from "@/types/security";
import type { ScanMode, ThreatLens } from "@/server/lenses";
import type { AnalysisMode, RepositoryFile, ScanProgressEvent, ScanReport } from "@/server/types";

export type ScanRecord = {
  id: string;
  authorized: boolean;
  status: ScanProgressEvent["stage"] | "queued";
  progress: number;
  analysisMode: AnalysisMode;
  scanMode: ScanMode;
  source: "demo" | "github";
  githubUrl?: string;
  requestedLenses: ThreatLens[];
  events: ScanProgressEvent[];
  listeners: Set<(event: ScanProgressEvent) => void>;
  files: RepositoryFile[];
  findings: SecurityFinding[];
  report: ScanReport | null;
  error: string | null;
};

const globalStore = globalThis as typeof globalThis & {
  __c0rtexScans?: Map<string, ScanRecord>;
};

const scans = globalStore.__c0rtexScans ?? new Map<string, ScanRecord>();
globalStore.__c0rtexScans = scans;

export function createScanRecord(
  authorized: boolean,
  scanMode: ScanMode = "auto",
  requestedLenses: ThreatLens[] = [],
  source: "demo" | "github" = "demo",
  githubUrl?: string,
): ScanRecord {
  const id = `scan_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  const record: ScanRecord = {
    id,
    authorized,
    status: "queued",
    progress: 0,
    analysisMode: "demo",
    scanMode,
    source,
    githubUrl,
    requestedLenses,
    events: [],
    listeners: new Set(),
    files: [],
    findings: [],
    report: null,
    error: null,
  };
  scans.set(id, record);
  return record;
}

export function getScanRecord(id: string) {
  return scans.get(id) ?? null;
}

export function emitScanEvent(record: ScanRecord, event: Omit<ScanProgressEvent, "scanId">) {
  const next: ScanProgressEvent = { ...event, scanId: record.id };
  record.status = event.stage;
  record.progress = event.progress;
  record.events = [...record.events, next];
  record.listeners.forEach((listener) => listener(next));
}

export function subscribeScan(record: ScanRecord, listener: (event: ScanProgressEvent) => void) {
  record.listeners.add(listener);
  return () => {
    record.listeners.delete(listener);
  };
}
