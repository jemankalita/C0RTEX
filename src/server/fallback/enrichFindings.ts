import { createDemoFindings } from "@/data/demoFindings";
import { impactForFinding, severityForRule } from "@/lib/score";
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
        codeBefore: context?.codeSnippets[0]?.content ?? finding.snippet ?? known.codeBefore,
      };
    }

    const severity = severityForRule(finding.ruleId);
    const confidence = Math.round(finding.confidence * 100);
    return {
      id: finding.id,
      ruleId: finding.ruleId,
      title: finding.title,
      category: finding.category,
      severity,
      status: "OPEN",
      file: finding.file,
      line: finding.startLine,
      locationLabel: finding.route ?? finding.file,
      confidence,
      reachability: "Needs review",
      scoreImpact: impactForFinding({ severity, confidence, scoreImpact: 0 }),
      whyItMatters: "A suspicious pattern was detected from static source context.",
      attackerStory: "Deterministic analysis flagged this pattern from the provided files only.",
      evidence: [finding.snippet],
      limitations: ["Static pattern match. Confirm reachability before treating this as a confirmed exploit."],
      codeBefore: finding.snippet,
      highlightTerms: [],
      attackPath: [],
    } satisfies SecurityFinding;
  });
}
