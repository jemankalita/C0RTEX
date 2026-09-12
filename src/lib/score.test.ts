import { describe, expect, it } from "vitest";
import {
  categoryScoresFromStatus,
  countFindingsBySeverity,
  gradeFromScore,
  INITIAL_SCORE,
  RESOLVED_PRIMARY_SCORE,
  scoreFromFindings,
} from "@/lib/score";
import { createDemoFindings } from "@/data/demoFindings";

describe("gradeFromScore", () => {
  it("maps the demo scores to the advertised grades", () => {
    expect(gradeFromScore(INITIAL_SCORE)).toBe("C");
    expect(gradeFromScore(RESOLVED_PRIMARY_SCORE)).toBe("B");
  });

  it("uses the remaining grade bands", () => {
    expect(gradeFromScore(95)).toBe("A");
    expect(gradeFromScore(50)).toBe("D");
    expect(gradeFromScore(10)).toBe("F");
  });
});

describe("scoreFromFindings", () => {
  it("starts at 64 and becomes 86 after the primary finding is resolved", () => {
    const open = createDemoFindings();
    expect(scoreFromFindings(open)).toBe(64);

    const resolved = open.map((finding) =>
      finding.id === "missing-object-auth" ? { ...finding, status: "RESOLVED" as const } : finding,
    );
    expect(scoreFromFindings(resolved)).toBe(86);
  });
});

describe("countFindingsBySeverity", () => {
  it("counts open findings and ignores resolved ones", () => {
    const findings = createDemoFindings();
    expect(countFindingsBySeverity(findings)).toEqual({ high: 5, medium: 6, low: 3 });

    const resolvedPrimary = findings.map((finding) =>
      finding.id === "missing-object-auth" ? { ...finding, status: "RESOLVED" as const } : finding,
    );
    expect(countFindingsBySeverity(resolvedPrimary)).toEqual({ high: 4, medium: 6, low: 3 });
  });
});

describe("categoryScoresFromStatus", () => {
  it("improves authorization after the primary finding is resolved", () => {
    expect(categoryScoresFromStatus("OPEN").authorization).toBe(48);
    expect(categoryScoresFromStatus("RESOLVED").authorization).toBe(88);
  });
});
