import { describe, expect, it } from "vitest";
import { createDemoFindings } from "@/data/demoFindings";
import { EMPTY_FINDING, resolveSelectedFinding } from "@/lib/selectFinding";

describe("resolveSelectedFinding", () => {
  it("returns the matching finding when the id exists", () => {
    const findings = createDemoFindings();
    expect(resolveSelectedFinding(findings, "unsafe-html").id).toBe("unsafe-html");
  });

  it("falls back to the first finding when the id is stale", () => {
    const findings = createDemoFindings();
    expect(resolveSelectedFinding(findings, "gone").id).toBe(findings[0].id);
  });

  it("returns a stable empty finding when the list is empty", () => {
    expect(resolveSelectedFinding([], "missing-object-auth")).toBe(EMPTY_FINDING);
    expect(resolveSelectedFinding([], "missing-object-auth").id).toBe("");
  });
});
