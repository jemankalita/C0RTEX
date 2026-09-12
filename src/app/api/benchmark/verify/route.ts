import { NextResponse } from "next/server";
import { KAGGLE_BENCH_SAMPLES } from "@/data/kaggleBenchSamples";
import { buildBenchProof, parseBenchSnippetBody, scanBenchSnippet } from "@/lib/benchProof";
import { evaluateKaggleBench } from "@/lib/evaluateKaggleBench";

function ok<T>(data: T) {
  return NextResponse.json({ success: true, data, error: null });
}

function fail(error: string, status: number) {
  return NextResponse.json({ success: false, data: null, error }, { status });
}

export async function GET() {
  const report = evaluateKaggleBench(KAGGLE_BENCH_SAMPLES);
  return ok(buildBenchProof(report, new Date().toISOString()));
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("Invalid request body.", 400);
  }

  const parsed = parseBenchSnippetBody(body);
  if ("error" in parsed) {
    return fail(parsed.error, 400);
  }

  return ok({
    ...scanBenchSnippet(parsed),
    scannedAt: new Date().toISOString(),
  });
}
