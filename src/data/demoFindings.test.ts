import { describe, expect, it } from "vitest";
import { createDemoFindings } from "@/data/demoFindings";

describe("createDemoFindings", () => {
  it("seeds the five demo rule families without real credentials", () => {
    const findings = createDemoFindings();
    expect(findings).toHaveLength(5);
    expect(findings.map((finding) => finding.id)).toEqual([
      "missing-object-auth",
      "sql-injection",
      "wildcard-cors",
      "hardcoded-secret",
      "unsafe-html",
    ]);
    expect(JSON.stringify(findings)).not.toMatch(/AKIA|ghp_|sk_live|password\s*=\s*["'][^"']{8,}/i);
    expect(findings[3].codeBefore).toContain("sk_demo_not_a_real_secret_123");
  });
});
