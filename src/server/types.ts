import type { SecurityFinding } from "@/types/security";

export type RepositoryFile = {
  path: string;
  content: string;
};

export type RepositoryMetadata = {
  language: string;
  framework?: string;
  fileCount: number;
};

export type LoadedRepository = {
  id: string;
  name: string;
  language: string;
  framework?: string;
  files: RepositoryFile[];
  metadata: RepositoryMetadata;
};

export type RawFinding = {
  id: string;
  ruleId: string;
  category: string;
  title: string;
  file: string;
  startLine: number;
  endLine: number;
  snippet: string;
  route?: string;
  source?: string;
  sink?: string;
  confidence: number;
  metadata?: Record<string, unknown>;
};

export type FindingContext = {
  finding: RawFinding;
  repositorySummary: string;
  codeSnippets: {
    file: string;
    startLine: number;
    endLine: number;
    content: string;
  }[];
  relatedRoutes: string[];
  relatedMiddleware: string[];
  relatedTests: string[];
};

export type ScanProgressEvent = {
  scanId: string;
  stage:
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
  label: string;
  detail?: string;
  progress: number;
  agent?: string;
  status: "pending" | "running" | "complete" | "partial" | "failed";
};

export type AgentResult = {
  agent: string;
  status: "complete" | "partial" | "failed";
  summary: string;
  findings?: RawFinding[];
  extra?: Record<string, unknown>;
  error?: string;
};

export type ScanReport = {
  scanId: string;
  analysisMode: "demo" | "live";
  findings: SecurityFinding[];
  limitations: string[];
  failedAgents: string[];
  publicRoutes: number;
  authenticatedRoutes: number;
  databaseSinks: number;
  sensitiveOperations: number;
};

export type AnalysisMode = "demo" | "live";
