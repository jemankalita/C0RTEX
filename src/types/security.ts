export type ScanStatus =
  | "idle"
  | "preparing"
  | "mapping"
  | "tracing"
  | "reasoning"
  | "scoring"
  | "report_ready"
  | "patch_ready"
  | "rechecking"
  | "resolved"
  | "error";

export type FindingSeverity =
  | "CRITICAL"
  | "HIGH"
  | "MEDIUM"
  | "LOW"
  | "NEEDS_REVIEW";

export type FindingStatus =
  | "OPEN"
  | "UNDER_REVIEW"
  | "PATCH_APPLIED"
  | "RESOLVED";

export type AttackPathNodeStatus = "discovered" | "suspicious" | "risky" | "fixed";

export type AttackPathNode = {
  id: string;
  label: string;
  type: "entry" | "input" | "handler" | "sink" | "missing-control" | "impact";
  file?: string;
  line?: number;
  description?: string;
  status: AttackPathNodeStatus;
};

export type SecurityFinding = {
  id: string;
  ruleId?: string;
  title: string;
  category: string;
  severity: FindingSeverity;
  status: FindingStatus;
  file: string;
  line: number;
  locationLabel: string;
  confidence: number;
  reachability: string;
  scoreImpact: number;
  whyItMatters: string;
  attackerStory: string;
  evidence: string[];
  limitations: string[];
  codeBefore: string;
  highlightTerms: string[];
  relatedTest?: string;
  relatedTestExcerpt?: string;
  patch?: string;
  patchExplanation?: string;
  attackPath: AttackPathNode[];
};

export type ScanSummary = {
  score: number;
  grade: string;
  confidence: number;
  publicRoutes: number;
  authenticatedRoutes: number;
  adminRoutes: number;
  databaseSinks: number;
  externalApiCalls: number;
  sensitiveOperations: number;
  high: number;
  medium: number;
  low: number;
};

export type CategoryScores = {
  authorization: number;
  inputHandling: number;
  configuration: number;
  secrets: number;
  authentication: number;
};

export type DemoRepository = {
  name: string;
  description: string;
  language: string;
  framework: string;
  files: number;
  routes: number;
  publicRoutes: number;
  authenticatedRoutes: number;
  adminRoutes: number;
  databaseSinks: number;
  externalApiCalls: number;
  sensitiveOperations: number;
  tests: number;
  fileList: string[];
};

export type SourceKind = "demo" | "zip" | "github";

export type ScanMode = "auto" | "guided";

export type ThreatLens =
  | "access-control"
  | "injection"
  | "browser-safety"
  | "secrets"
  | "configuration";

export type ScanErrorKind =
  | "unsupported_type"
  | "too_large"
  | "scan_failure"
  | "missing_context"
  | "patch_failure";
