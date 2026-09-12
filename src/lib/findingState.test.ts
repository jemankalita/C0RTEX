import { describe, expect, it } from "vitest";
import { applyDemoPatch, recheckFinding, sortFindings } from "@/lib/findingState";
import { createDemoFindings } from "@/data/demoFindings";

describe("finding state", () => {
  it("sorts findings by severity", () => {
    const titles = sortFindings(createDemoFindings()).map((finding) => finding.severity);
    expect(titles.slice(0, 2)).toEqual(["HIGH", "HIGH"]);
  });

  it("applies a patch only to a temporary finding copy", () => {
    const original = createDemoFindings();
    const result = applyDemoPatch(original, "missing-object-auth");
    expect("error" in result).toBe(false);
    if ("error" in result) return;

    expect(original[0].status).toBe("OPEN");
    expect(result.findings.find((finding) => finding.id === "missing-object-auth")?.status).toBe(
      "PATCH_APPLIED",
    );
    expect(result.score).toBe(64);
  });

  it("fails cleanly when a patch is missing", () => {
    const findings = createDemoFindings().map((finding) =>
      finding.id === "missing-object-auth" ? { ...finding, patch: undefined } : finding,
    );
    expect(applyDemoPatch(findings, "missing-object-auth")).toEqual({ error: "patch_failure" });
  });

  it("resolves the primary path and raises the score on recheck", () => {
    const patched = applyDemoPatch(createDemoFindings(), "missing-object-auth");
    if ("error" in patched) throw new Error("expected patch");

    const result = recheckFinding(patched.findings, "missing-object-auth");
    const primary = result.findings.find((finding) => finding.id === "missing-object-auth");

    expect(result.score).toBe(86);
    expect(result.resolvedPrimary).toBe(true);
    expect(primary?.status).toBe("RESOLVED");
    expect(primary?.attackPath.every((node) => node.status === "fixed")).toBe(true);
  });
});
