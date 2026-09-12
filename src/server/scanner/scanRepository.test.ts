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

  it("flags generic unsafe HTML in a live repository file", () => {
    const findings = scanRepository({
      id: "live",
      name: "live",
      language: "TypeScript",
      files: [
        {
          path: "src/Review.tsx",
          content: "export function Review({ html }: { html: string }) {\n  return <div dangerouslySetInnerHTML={{ __html: html }} />;\n}\n",
        },
      ],
      metadata: { language: "TypeScript", fileCount: 1 },
    });
    expect(findings.some((finding) => finding.ruleId === "unsafe-html")).toBe(true);
  });
});
