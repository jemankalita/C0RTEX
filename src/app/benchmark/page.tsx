import { BenchmarkPage } from "@/components/benchmark/BenchmarkPage";
import { KAGGLE_BENCH_SAMPLES } from "@/data/kaggleBenchSamples";
import { evaluateKaggleBench } from "@/lib/evaluateKaggleBench";

export default function BenchmarkRoutePage() {
  const report = evaluateKaggleBench(KAGGLE_BENCH_SAMPLES);
  return <BenchmarkPage report={report} />;
}
