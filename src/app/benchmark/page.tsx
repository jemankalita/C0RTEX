import { BenchmarkPage } from "@/components/benchmark/BenchmarkPage";
import { KAGGLE_BENCH_SAMPLES } from "@/data/kaggleBenchSamples";
import { buildBenchProof } from "@/lib/benchProof";
import { evaluateKaggleBench } from "@/lib/evaluateKaggleBench";

export default function BenchmarkRoutePage() {
  const report = evaluateKaggleBench(KAGGLE_BENCH_SAMPLES);
  const proof = buildBenchProof(report, new Date().toISOString());
  return <BenchmarkPage report={report} proof={proof} />;
}
