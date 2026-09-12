import { PRIMARY_FINDING_ID, scoreFromFindings } from "@/lib/score";
import type { FindingStatus, SecurityFinding } from "@/types/security";

export function sortFindings(findings: SecurityFinding[]): SecurityFinding[] {
  const rank: Record<SecurityFinding["severity"], number> = {
    CRITICAL: 0,
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3,
    NEEDS_REVIEW: 4,
  };

  return [...findings].sort((left, right) => rank[left.severity] - rank[right.severity]);
}

export function withFindingStatus(
  findings: SecurityFinding[],
  findingId: string,
  status: FindingStatus,
): SecurityFinding[] {
  return findings.map((finding) => {
    if (finding.id !== findingId) {
      return finding;
    }

    if (status === "RESOLVED") {
      return {
        ...finding,
        status,
        attackPath: finding.attackPath.map((node) => ({
          ...node,
          status: "fixed" as const,
        })),
      };
    }

    return { ...finding, status };
  });
}

export function applyDemoPatch(
  findings: SecurityFinding[],
  findingId: string,
): { findings: SecurityFinding[]; score: number } | { error: "patch_failure" } {
  const target = findings.find((finding) => finding.id === findingId);
  if (!target || !target.patch) {
    return { error: "patch_failure" };
  }

  const nextFindings = withFindingStatus(findings, findingId, "PATCH_APPLIED");
  return {
    findings: nextFindings,
    score: scoreFromFindings(nextFindings),
  };
}

export function recheckFinding(
  findings: SecurityFinding[],
  findingId: string,
): { findings: SecurityFinding[]; score: number; resolvedPrimary: boolean } {
  const nextFindings = withFindingStatus(findings, findingId, "RESOLVED");
  return {
    findings: nextFindings,
    score: scoreFromFindings(nextFindings),
    resolvedPrimary: findingId === PRIMARY_FINDING_ID,
  };
}
