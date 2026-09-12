import { describe, expect, it } from "vitest";
import { KAGGLE_BENCH_SAMPLES } from "@/data/kaggleBenchSamples";
import { buildBenchProof, parseBenchSnippetBody, scanBenchSnippet } from "@/lib/benchProof";
import { evaluateKaggleBench } from "@/lib/evaluateKaggleBench";

describe("buildBenchProof", () => {
  it("derives witnesses from a live scanner report instead of static copy", () => {
    const report = evaluateKaggleBench(KAGGLE_BENCH_SAMPLES);
    const proof = buildBenchProof(report, "2026-09-13T00:00:00.000Z");

    expect(proof.engine).toBe("scanRepository");
    expect(proof.computedAt).toBe("2026-09-13T00:00:00.000Z");
    expect(proof.metrics.f1).toBe(report.f1);
    expect(proof.metrics.falseNegatives).toBeGreaterThan(0);

    const roles = proof.witnesses.map((item) => item.role);
    expect(roles).toEqual(["detected", "missed", "clear"]);
    expect(proof.witnesses[0]?.predictedRules.length).toBeGreaterThan(0);
    expect(proof.witnesses[1]?.predictedRules).toEqual([]);
    expect(proof.witnesses[2]?.outcome).toBe("true-negative");
  });
});

describe("scanBenchSnippet", () => {
  it("runs the scanner on unseen code and leaves the input string unchanged", () => {
    const code = "export function look(req: any) {\n  return db.query(`SELECT * FROM t WHERE id = '${req.query.id}'`);\n}\n";
    const original = code;
    const result = scanBenchSnippet({
      code,
      path: "src/look.ts",
      language: "TypeScript",
    });

    expect(code).toBe(original);
    expect(result.predictedRules).toContain("sql-injection");
    expect(result.findings[0]?.snippet).toContain("db.query");
  });

  it("returns no rules for parameterized SQL", () => {
    const result = scanBenchSnippet({
      code: "db.query('SELECT * FROM t WHERE id = $1', [id])",
      path: "src/look.ts",
      language: "TypeScript",
    });
    expect(result.predictedRules).toEqual([]);
  });
});

describe("parseBenchSnippetBody", () => {
  it("rejects empty or oversized payloads", () => {
    expect(parseBenchSnippetBody(null)).toEqual({ error: "Send a JSON object with a code field." });
    expect(parseBenchSnippetBody({ code: "   " })).toEqual({ error: "Code is required." });
    expect(parseBenchSnippetBody({ code: "x".repeat(4001) })).toMatchObject({ error: expect.stringMatching(/4000/) });
  });

  it("fills default path and language", () => {
    expect(parseBenchSnippetBody({ code: "const n = 1" })).toEqual({
      code: "const n = 1",
      path: "src/snippet.ts",
      language: "TypeScript",
    });
  });
});
