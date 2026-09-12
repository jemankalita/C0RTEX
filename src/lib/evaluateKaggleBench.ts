import { KAGGLE_BENCH_ATTRIBUTION, type BenchFamily, type BenchSample } from "@/data/kaggleBenchSamples";
import { scanRepository } from "@/server/scanner/scanRepository";
import type { LoadedRepository } from "@/server/types";

const RULE_FAMILY: Record<string, BenchFamily> = {
  "sql-injection": "injection",
  "command-injection": "injection",
  "path-traversal": "injection",
  ssrf: "injection",
  "unsafe-html": "browser-safety",
  "open-redirect": "browser-safety",
  "hardcoded-secret": "secrets",
  "insecure-jwt": "secrets",
  "missing-object-auth": "access-control",
  "mass-assignment": "access-control",
  "auth-fallback": "access-control",
  "wildcard-cors": "configuration",
  "debug-env": "configuration",
  "insecure-cookie": "configuration",
};

export type BenchOutcome = "true-positive" | "true-negative" | "false-positive" | "false-negative";

export type BenchExample = {
  id: string;
  family: BenchFamily;
  cwe: string;
  language: string;
  code: string;
  outcome: BenchOutcome;
  familyMatch: boolean;
  predictedRules: string[];
};

export type BenchFamilyStats = {
  family: Exclude<BenchFamily, "safe">;
  labeled: number;
  hits: number;
  familyHits: number;
};

export type BenchReport = {
  title: string;
  dataset: string;
  href: string;
  note: string;
  total: number;
  vulnerable: number;
  safe: number;
  truePositives: number;
  trueNegatives: number;
  falsePositives: number;
  falseNegatives: number;
  precision: number;
  recall: number;
  f1: number;
  families: BenchFamilyStats[];
  examples: BenchExample[];
};

export function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function familyForRule(ruleId: string): BenchFamily | null {
  return RULE_FAMILY[ruleId] ?? null;
}

function ratio(numerator: number, denominator: number) {
  if (denominator === 0) return 0;
  return numerator / denominator;
}

function asRepository(sample: BenchSample): LoadedRepository {
  return {
    id: sample.id,
    name: sample.id,
    language: sample.language,
    files: [{ path: sample.path, content: sample.code }],
    metadata: { language: sample.language, fileCount: 1 },
  };
}

export function evaluateKaggleBench(samples: BenchSample[]): BenchReport {
  const examples = samples.map((sample) => {
    const findings = scanRepository(asRepository(sample));
    const predictedRules = [...new Set(findings.map((finding) => finding.ruleId))];
    const predicted = predictedRules.length > 0;
    const labeledVulnerable = sample.family !== "safe";
    const outcome: BenchOutcome = labeledVulnerable
      ? predicted
        ? "true-positive"
        : "false-negative"
      : predicted
        ? "false-positive"
        : "true-negative";
    const familyMatch =
      labeledVulnerable && predictedRules.some((ruleId) => familyForRule(ruleId) === sample.family);

    return {
      id: sample.id,
      family: sample.family,
      cwe: sample.cwe,
      language: sample.language,
      code: sample.code,
      outcome,
      familyMatch,
      predictedRules,
    };
  });

  const truePositives = examples.filter((item) => item.outcome === "true-positive").length;
  const trueNegatives = examples.filter((item) => item.outcome === "true-negative").length;
  const falsePositives = examples.filter((item) => item.outcome === "false-positive").length;
  const falseNegatives = examples.filter((item) => item.outcome === "false-negative").length;
  const precision = ratio(truePositives, truePositives + falsePositives);
  const recall = ratio(truePositives, truePositives + falseNegatives);
  const families = (["injection", "browser-safety", "secrets", "access-control", "configuration"] as const).map(
    (family) => {
      const labeled = examples.filter((item) => item.family === family);
      return {
        family,
        labeled: labeled.length,
        hits: labeled.filter((item) => item.outcome === "true-positive").length,
        familyHits: labeled.filter((item) => item.familyMatch).length,
      };
    },
  );

  return {
    title: KAGGLE_BENCH_ATTRIBUTION.title,
    dataset: KAGGLE_BENCH_ATTRIBUTION.dataset,
    href: KAGGLE_BENCH_ATTRIBUTION.href,
    note: KAGGLE_BENCH_ATTRIBUTION.note,
    total: samples.length,
    vulnerable: samples.filter((sample) => sample.family !== "safe").length,
    safe: samples.filter((sample) => sample.family === "safe").length,
    truePositives,
    trueNegatives,
    falsePositives,
    falseNegatives,
    precision,
    recall,
    f1: ratio(2 * precision * recall, precision + recall),
    families,
    examples,
  };
}
