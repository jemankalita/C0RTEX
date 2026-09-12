import { describe, expect, it } from "vitest";
import type { BenchSample } from "@/data/kaggleBenchSamples";
import { evaluateKaggleBench, familyForRule, formatPercent } from "@/lib/evaluateKaggleBench";

const fixtures: BenchSample[] = [
  {
    id: "sql-1",
    language: "TypeScript",
    family: "injection",
    cwe: "CWE-89",
    source: "kaggle-style labeled snippet",
    path: "src/search.ts",
    code: "db.query(`SELECT * FROM items WHERE name LIKE '%${req.query.q}%'`)",
  },
  {
    id: "safe-1",
    language: "TypeScript",
    family: "safe",
    cwe: "N/A",
    source: "kaggle-style labeled snippet",
    path: "src/search.ts",
    code: "db.query('SELECT * FROM items WHERE name LIKE $1', [`%${q}%`])",
  },
  {
    id: "python-eval",
    language: "Python",
    family: "injection",
    cwe: "CWE-94",
    source: "kaggle-style labeled snippet",
    path: "app.py",
    code: "eval(request.args['expr'])",
  },
];

describe("formatPercent", () => {
  it("rounds a ratio to a whole percent", () => {
    expect(formatPercent(2 / 3)).toBe("67%");
  });
});

describe("familyForRule", () => {
  it("maps scanner rules onto bench families", () => {
    expect(familyForRule("sql-injection")).toBe("injection");
    expect(familyForRule("unsafe-html")).toBe("browser-safety");
    expect(familyForRule("hardcoded-secret")).toBe("secrets");
    expect(familyForRule("missing-object-auth")).toBe("access-control");
    expect(familyForRule("wildcard-cors")).toBe("configuration");
  });
});

describe("evaluateKaggleBench", () => {
  it("scores labeled snippets without mutating the input list", () => {
    const original = fixtures.map((sample) => ({ ...sample }));
    const report = evaluateKaggleBench(fixtures);

    expect(fixtures).toEqual(original);
    expect(report.total).toBe(3);
    expect(report.vulnerable).toBe(2);
    expect(report.safe).toBe(1);
    expect(report.truePositives).toBe(1);
    expect(report.trueNegatives).toBe(1);
    expect(report.falseNegatives).toBe(1);
    expect(report.falsePositives).toBe(0);
    expect(report.precision).toBe(1);
    expect(report.recall).toBe(0.5);
    expect(report.f1).toBe(2 / 3);

    const sql = report.examples.find((item) => item.id === "sql-1");
    expect(sql?.outcome).toBe("true-positive");
    expect(sql?.familyMatch).toBe(true);

    const missed = report.examples.find((item) => item.id === "python-eval");
    expect(missed?.outcome).toBe("false-negative");
  });
});
