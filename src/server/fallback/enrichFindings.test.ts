import { describe, expect, it } from "vitest";
import { enrichWithDemoKnowledge } from "@/server/fallback/enrichFindings";
import { scoreFromFindings } from "@/lib/score";

describe("enrichWithDemoKnowledge", () => {
  it("assigns real severity and impact instead of a generic review-only finding", () => {
    const findings = enrichWithDemoKnowledge(
      [
        {
          id: "hardcoded-secret:app.ts:4",
          ruleId: "hardcoded-secret",
          category: "Cryptographic/Secret Management",
          title: "Hardcoded service secret",
          file: "app.ts",
          startLine: 4,
          endLine: 4,
          snippet: `apiKey: "sk_live_demo_key_123"`,
          confidence: 0.9,
        },
      ],
      [],
    );

    expect(findings[0].severity).not.toBe("NEEDS_REVIEW");
    expect(findings[0].scoreImpact).toBeLessThan(0);
    expect(scoreFromFindings(findings)).toBeLessThan(100);
    expect(scoreFromFindings(findings)).not.toBe(64);
  });
});
