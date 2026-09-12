import type { CategoryScores, FindingSeverity, SecurityFinding } from "@/types/security";

export const CLEAN_SCORE = 100;
export const PRIMARY_FINDING_ID = "missing-object-auth";

const RULE_SEVERITY: Record<string, FindingSeverity> = {
  "missing-object-auth": "CRITICAL",
  "sql-injection": "HIGH",
  "command-injection": "HIGH",
  "path-traversal": "HIGH",
  "ssrf": "HIGH",
  "hardcoded-secret": "HIGH",
  "insecure-jwt": "HIGH",
  "auth-fallback": "HIGH",
  "unsafe-html": "MEDIUM",
  "open-redirect": "MEDIUM",
  "mass-assignment": "MEDIUM",
  "wildcard-cors": "MEDIUM",
  "debug-env": "LOW",
  "insecure-cookie": "LOW",
};

const SEVERITY_IMPACT: Record<FindingSeverity, number> = {
  CRITICAL: -18,
  HIGH: -12,
  MEDIUM: -7,
  LOW: -3,
  NEEDS_REVIEW: -2,
};

const CATEGORY_KEYS: Array<{ key: keyof CategoryScores; match: RegExp }> = [
  { key: "authorization", match: /access control|authoriz/i },
  { key: "authentication", match: /authn|authentication|session|cookie/i },
  { key: "inputHandling", match: /injection|xss|input/i },
  { key: "secrets", match: /secret|crypto/i },
  { key: "configuration", match: /config|misconfig|cors|debug/i },
];

export function gradeFromScore(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 64) return "C";
  if (score >= 50) return "D";
  return "F";
}

export function countFindingsBySeverity(findings: SecurityFinding[]) {
  const open = findings.filter((finding) => finding.status !== "RESOLVED");
  return {
    high: open.filter((finding) => finding.severity === "HIGH" || finding.severity === "CRITICAL").length,
    medium: open.filter((finding) => finding.severity === "MEDIUM").length,
    low: open.filter((finding) => finding.severity === "LOW" || finding.severity === "NEEDS_REVIEW").length,
  };
}

export function isPrimaryAuthorizationFinding(finding: Pick<SecurityFinding, "id" | "title">): boolean {
  return (
    finding.id === PRIMARY_FINDING_ID ||
    finding.id.includes("missing-object-auth") ||
    finding.title.toLowerCase().includes("object authorization")
  );
}

function isOpenRisk(finding: SecurityFinding) {
  return finding.status !== "RESOLVED";
}

export function severityForRule(ruleId?: string): FindingSeverity {
  if (!ruleId) return "NEEDS_REVIEW";
  return RULE_SEVERITY[ruleId] ?? RULE_SEVERITY[ruleId.split(":")[0]] ?? "NEEDS_REVIEW";
}

export function impactForFinding(finding: Pick<SecurityFinding, "severity" | "scoreImpact" | "confidence">): number {
  if (Number.isFinite(finding.scoreImpact) && finding.scoreImpact !== 0) {
    return -Math.abs(finding.scoreImpact);
  }
  const confidence = Math.min(100, Math.max(0, finding.confidence ?? 80)) / 100;
  return Math.round(SEVERITY_IMPACT[finding.severity] * (0.7 + 0.3 * confidence));
}

export function scoreFromFindings(findings: SecurityFinding[]): number {
  const penalties = findings.filter(isOpenRisk).map((finding) => Math.abs(impactForFinding(finding)));
  if (penalties.length === 0) {
    return CLEAN_SCORE;
  }

  const leading = Math.max(...penalties);
  const residual = penalties.reduce((sum, penalty) => sum + penalty, 0) - leading;
  const penalty = leading + residual * 0.25;
  return Math.max(0, Math.min(CLEAN_SCORE, Math.round(CLEAN_SCORE - penalty)));
}

export function scanConfidenceFromFindings(findings: SecurityFinding[]): number {
  if (findings.length === 0) return 70;
  const total = findings.reduce((sum, finding) => sum + Math.min(100, Math.max(0, finding.confidence)), 0);
  return Math.round(total / findings.length);
}

function categoryForFinding(finding: SecurityFinding): keyof CategoryScores {
  const matched = CATEGORY_KEYS.find((entry) => entry.match.test(finding.category));
  return matched?.key ?? "configuration";
}

export function categoryScoresFromFindings(findings: SecurityFinding[]): CategoryScores {
  const base: CategoryScores = {
    authorization: CLEAN_SCORE,
    inputHandling: CLEAN_SCORE,
    configuration: CLEAN_SCORE,
    secrets: CLEAN_SCORE,
    authentication: CLEAN_SCORE,
  };

  return findings.filter(isOpenRisk).reduce((scores, finding) => {
    const key = categoryForFinding(finding);
    return {
      ...scores,
      [key]: Math.max(0, scores[key] - Math.abs(impactForFinding(finding))),
    };
  }, base);
}
