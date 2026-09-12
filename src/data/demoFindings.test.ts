import { describe, expect, it } from "vitest";
import { createDemoFindings } from "@/data/demoFindings";

describe("createDemoFindings", () => {
  it("seeds the demo rule families without real credentials", () => {
    const findings = createDemoFindings();
    expect(findings.map((finding) => finding.id)).toEqual([
      "missing-object-auth",
      "sql-injection",
      "command-injection",
      "path-traversal",
      "ssrf",
      "wildcard-cors",
      "hardcoded-secret",
      "insecure-jwt",
      "open-redirect",
      "mass-assignment",
      "auth-fallback",
      "unsafe-html",
      "debug-env",
      "insecure-cookie",
    ]);
    expect(findings[0].severity).toBe("CRITICAL");
    expect(JSON.stringify(findings)).not.toMatch(/AKIA|ghp_|sk_live|password\s*=\s*["'][^"']{8,}/i);
    expect(findings.find((finding) => finding.id === "hardcoded-secret")?.codeBefore).toContain(
      "sk_demo_not_a_real_secret_123",
    );
  });
});
