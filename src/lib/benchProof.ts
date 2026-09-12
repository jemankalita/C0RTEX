import type { BenchExample, BenchOutcome, BenchReport } from "@/lib/evaluateKaggleBench";
import { scanRepository } from "@/server/scanner/scanRepository";

export type BenchProofRole = "detected" | "missed" | "clear";

export type BenchProofWitness = {
  role: BenchProofRole;
  id: string;
  family: string;
  cwe: string;
  language: string;
  code: string;
  outcome: BenchOutcome;
  predictedRules: string[];
};

export type BenchProof = {
  method: string;
  engine: "scanRepository";
  computedAt: string;
  dataset: string;
  href: string;
  note: string;
  metrics: {
    total: number;
    truePositives: number;
    falseNegatives: number;
    falsePositives: number;
    trueNegatives: number;
    precision: number;
    recall: number;
    f1: number;
  };
  witnesses: BenchProofWitness[];
};

export type BenchSnippetScan = {
  predictedRules: string[];
  findings: Array<{
    ruleId: string;
    title: string;
    snippet: string;
    startLine: number;
  }>;
};

const ROLE_BY_OUTCOME: Partial<Record<BenchOutcome, BenchProofRole>> = {
  "true-positive": "detected",
  "false-negative": "missed",
  "true-negative": "clear",
};

const WITNESS_ORDER: BenchProofRole[] = ["detected", "missed", "clear"];

function toWitness(example: BenchExample, role: BenchProofRole): BenchProofWitness {
  return {
    role,
    id: example.id,
    family: example.family,
    cwe: example.cwe,
    language: example.language,
    code: example.code,
    outcome: example.outcome,
    predictedRules: [...example.predictedRules],
  };
}

export function buildBenchProof(report: BenchReport, computedAt: string): BenchProof {
  const witnesses = WITNESS_ORDER.flatMap((role) => {
    const example = report.examples.find((item) => ROLE_BY_OUTCOME[item.outcome] === role);
    return example ? [toWitness(example, role)] : [];
  });

  return {
    method: "Each labeled snippet is scanned with scanRepository. Metrics compare fired rules to the label.",
    engine: "scanRepository",
    computedAt,
    dataset: report.dataset,
    href: report.href,
    note: report.note,
    metrics: {
      total: report.total,
      truePositives: report.truePositives,
      falseNegatives: report.falseNegatives,
      falsePositives: report.falsePositives,
      trueNegatives: report.trueNegatives,
      precision: report.precision,
      recall: report.recall,
      f1: report.f1,
    },
    witnesses,
  };
}

export function scanBenchSnippet(input: { code: string; path: string; language: string }): BenchSnippetScan {
  const findings = scanRepository({
    id: "bench-snippet",
    name: "bench-snippet",
    language: input.language,
    files: [{ path: input.path, content: input.code }],
    metadata: { language: input.language, fileCount: 1 },
  });

  return {
    predictedRules: [...new Set(findings.map((finding) => finding.ruleId))],
    findings: findings.map((finding) => ({
      ruleId: finding.ruleId,
      title: finding.title,
      snippet: finding.snippet,
      startLine: finding.startLine,
    })),
  };
}

export const SNIPPET_CODE_MAX = 4000;

export function parseBenchSnippetBody(body: unknown): { code: string; path: string; language: string } | { error: string } {
  if (!body || typeof body !== "object") {
    return { error: "Send a JSON object with a code field." };
  }
  const record = body as { code?: unknown; path?: unknown; language?: unknown };
  if (typeof record.code !== "string" || record.code.trim().length === 0) {
    return { error: "Code is required." };
  }
  if (record.code.length > SNIPPET_CODE_MAX) {
    return { error: `Code must be ${SNIPPET_CODE_MAX} characters or fewer.` };
  }
  const path = typeof record.path === "string" && record.path.trim() ? record.path.trim() : "src/snippet.ts";
  const language = typeof record.language === "string" && record.language.trim() ? record.language.trim() : "TypeScript";
  return { code: record.code, path, language };
}
