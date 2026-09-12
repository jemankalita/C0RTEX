import { describe, expect, it } from "vitest";
import { loadDemoRepository } from "@/server/repository/loadDemoRepository";
import { scanRepository } from "@/server/scanner/scanRepository";

describe("scanRepository", () => {
  it("flags the harbor-market demo issues including the critical IDOR", async () => {
    const repository = await loadDemoRepository();
    const findings = scanRepository(repository);
    const ids = findings.map((finding) => finding.id);

    expect(ids).toContain("missing-object-auth");
    expect(ids).toContain("sql-injection");
    expect(ids).toContain("command-injection");
    expect(ids).toContain("path-traversal");
    expect(ids).toContain("ssrf");
    expect(ids).toContain("hardcoded-secret");
    expect(ids).toContain("unsafe-html");
    expect(findings.find((finding) => finding.id === "missing-object-auth")?.file).toBe(
      "src/routes/orders.ts",
    );
  });
});
