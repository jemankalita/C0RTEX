import type { CategoryScores, FindingStatus, SecurityFinding } from "@/types/security";

export const INITIAL_SCORE = 64;
export const RESOLVED_PRIMARY_SCORE = 86;
export const PRIMARY_FINDING_ID = "missing-object-auth";

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

export function scoreFromFindings(findings: SecurityFinding[]): number {
  const primaryResolved = findings.some(
    (finding) => finding.status === "RESOLVED" && isPrimaryAuthorizationFinding(finding),
  );
  if (primaryResolved) {
    return RESOLVED_PRIMARY_SCORE;
  }
  return INITIAL_SCORE;
}

export function categoryScoresFromStatus(primaryStatus: FindingStatus): CategoryScores {
  if (primaryStatus === "RESOLVED") {
    return {
      authorization: 88,
      inputHandling: 61,
      configuration: 72,
      secrets: 90,
      authentication: 84,
    };
  }

  return {
    authorization: 48,
    inputHandling: 61,
    configuration: 72,
    secrets: 90,
    authentication: 84,
  };
}
