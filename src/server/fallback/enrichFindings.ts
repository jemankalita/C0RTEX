import { createDemoFindings } from "@/data/demoFindings";
import type { SecurityFinding } from "@/types/security";
import type { FindingContext, RawFinding } from "@/server/types";

export function enrichWithDemoKnowledge(raw: RawFinding[], contexts: FindingContext[]): SecurityFinding[] {
  const catalog = createDemoFindings();
  return raw.map((finding) => {
    const known =
      catalog.find((item) => item.id === finding.id) ?? catalog.find((item) => item.id === finding.ruleId);
    const context = contexts.find((item) => item.finding.id === finding.id);
    if (known) {
      return {
        ...known,
        id: finding.id,
        ruleId: finding.ruleId,
        file: finding.file,
        line: finding.startLine,
        codeBefore: context?.codeSnippets[0]?.content ?? known.codeBefore,
      };
    }
    return {
      id: finding.id,
      ruleId: finding.ruleId,
      title: finding.title,
      category: finding.category,
      severity: "NEEDS_REVIEW",
      status: "OPEN",
      file: finding.file,
      line: finding.startLine,
      locationLabel: finding.route ?? finding.file,
      confidence: Math.round(finding.confidence * 100),
      reachability: "Needs review",
      scoreImpact:
        finding.ruleId === "unsafe-html"
          ? -8
          : finding.ruleId === "hardcoded-secret"
            ? -10
            : finding.ruleId === "sql-injection" || finding.ruleId === "missing-object-auth"
              ? -14
              : -6,
      whyItMatters: "A suspicious pattern was detected, but live model reasoning was not available.",
      attackerStory: "Deterministic analysis flagged this pattern from static source context only.",
      evidence: [finding.snippet],
      limitations: ["Demo analysis mode. Live model reasoning did not run."],
      codeBefore: finding.snippet,
      highlightTerms: [],
      attackPath: [],
    } satisfies SecurityFinding;
  });
}
