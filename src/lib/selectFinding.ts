import type { SecurityFinding } from "@/types/security";

export const EMPTY_FINDING: SecurityFinding = {
  id: "",
  title: "No findings yet",
  category: "None",
  severity: "NEEDS_REVIEW",
  status: "OPEN",
  file: "",
  line: 0,
  locationLabel: "",
  confidence: 0,
  reachability: "None",
  scoreImpact: 0,
  whyItMatters: "The scan did not produce a finding to review.",
  attackerStory: "No attack path is available until the scanner reports a finding.",
  evidence: [],
  limitations: ["No findings were returned for this scan."],
  codeBefore: "",
  highlightTerms: [],
  attackPath: [],
};

export function resolveSelectedFinding(
  findings: SecurityFinding[],
  selectedId: string,
): SecurityFinding {
  if (findings.length === 0) {
    return EMPTY_FINDING;
  }
  return findings.find((finding) => finding.id === selectedId) ?? findings[0];
}

export function activeFindingId(finding: SecurityFinding | undefined | null): string {
  return finding?.id ?? "";
}
