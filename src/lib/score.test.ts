import { describe, expect, it } from "vitest";
import { createDemoFindings } from "@/data/demoFindings";
import {
  categoryScoresFromFindings,
  countFindingsBySeverity,
  gradeFromScore,
  scoreFromFindings,
} from "@/lib/score";
import type { SecurityFinding } from "@/types/security";

function finding(overrides: Partial<SecurityFinding> = {}): SecurityFinding {
  return {
    id: "sample",
    title: "Sample",
    category: "Injection",
    severity: "HIGH",
    status: "OPEN",
    file: "src/app.ts",
    line: 1,
    locationLabel: "/api",
    confidence: 90,
    reachability: "Authenticated route",
    scoreImpact: -12,
    whyItMatters: "",
    attackerStory: "",
    evidence: [],
    limitations: [],
    codeBefore: "",
    highlightTerms: [],
    attackPath: [],
    ...overrides,
  };
}

describe("gradeFromScore", () => {
  it("maps score bands", () => {
    expect(gradeFromScore(95)).toBe("A");
    expect(gradeFromScore(84)).toBe("B");
    expect(gradeFromScore(70)).toBe("C");
    expect(gradeFromScore(50)).toBe("D");
    expect(gradeFromScore(10)).toBe("F");
  });
});

describe("scoreFromFindings", () => {
  it("scores a clean repository at 100", () => {
    expect(scoreFromFindings([])).toBe(100);
  });

  it("does not hardcode 64 for every open report", () => {
    const high = [finding({ id: "a", severity: "HIGH", scoreImpact: -12 })];
    const mixed = [
      finding({ id: "a", severity: "CRITICAL", scoreImpact: -18, category: "Broken Access Control" }),
      finding({ id: "b", severity: "LOW", scoreImpact: -3, category: "Security Misconfiguration" }),
    ];
    expect(scoreFromFindings(high)).not.toBe(64);
    expect(scoreFromFindings(mixed)).not.toBe(scoreFromFindings(high));
    expect(scoreFromFindings(mixed)).toBeLessThan(scoreFromFindings(high));
  });

  it("raises the score only after a finding is resolved, not merely patched", () => {
    const open = [finding({ id: "xss", severity: "MEDIUM", scoreImpact: -8 })];
    const patched = [{ ...open[0], status: "PATCH_APPLIED" as const }];
    const resolved = [{ ...open[0], status: "RESOLVED" as const }];

    expect(scoreFromFindings(open)).toBe(scoreFromFindings(patched));
    expect(scoreFromFindings(resolved)).toBe(100);
    expect(scoreFromFindings(resolved)).toBeGreaterThan(scoreFromFindings(open));
  });

  it("recovers exactly the resolved finding's impact", () => {
    const open = [
      finding({ id: "missing-object-auth", severity: "CRITICAL", scoreImpact: -18 }),
      finding({ id: "xss", severity: "MEDIUM", scoreImpact: -8 }),
    ];
    const resolved = open.map((item) =>
      item.id === "missing-object-auth" ? { ...item, status: "RESOLVED" as const } : item,
    );

    expect(scoreFromFindings(open)).toBe(80);
    expect(scoreFromFindings(resolved)).toBe(92);
    expect(scoreFromFindings(resolved)).toBeGreaterThan(scoreFromFindings(open));
  });

  it("scores the full demo corpus below the old canned 64 while issues remain", () => {
    expect(scoreFromFindings(createDemoFindings())).toBeLessThan(64);
  });
});

describe("countFindingsBySeverity", () => {
  it("counts open findings and ignores resolved ones", () => {
    const findings = createDemoFindings();
    expect(countFindingsBySeverity(findings)).toEqual({ high: 5, medium: 6, low: 3 });

    const resolvedPrimary = findings.map((item) =>
      item.id === "missing-object-auth" ? { ...item, status: "RESOLVED" as const } : item,
    );
    expect(countFindingsBySeverity(resolvedPrimary)).toEqual({ high: 4, medium: 6, low: 3 });
  });
});

describe("categoryScoresFromFindings", () => {
  it("derives category scores from the findings that remain open", () => {
    const open = [
      finding({
        id: "authz",
        category: "Broken Access Control",
        severity: "CRITICAL",
        scoreImpact: -18,
      }),
    ];
    const resolved = [{ ...open[0], status: "RESOLVED" as const }];

    expect(categoryScoresFromFindings(open).authorization).toBeLessThan(
      categoryScoresFromFindings(resolved).authorization,
    );
    expect(categoryScoresFromFindings([]).secrets).toBe(100);
  });
});
