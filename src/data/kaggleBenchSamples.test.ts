import { describe, expect, it } from "vitest";
import { KAGGLE_BENCH_SAMPLES } from "@/data/kaggleBenchSamples";
import { evaluateKaggleBench } from "@/lib/evaluateKaggleBench";

describe("KAGGLE_BENCH_SAMPLES", () => {
  it("evaluates the checked-in labeled slice into a complete report", () => {
    const report = evaluateKaggleBench(KAGGLE_BENCH_SAMPLES);
    expect(report.total).toBe(KAGGLE_BENCH_SAMPLES.length);
    expect(report.vulnerable + report.safe).toBe(report.total);
    expect(report.truePositives + report.falseNegatives).toBe(report.vulnerable);
    expect(report.trueNegatives + report.falsePositives).toBe(report.safe);
    expect(report.examples).toHaveLength(report.total);
    expect(report.f1).toBeGreaterThan(0.7);
    expect(report.examples.some((item) => item.outcome === "false-negative")).toBe(true);
  });
});
