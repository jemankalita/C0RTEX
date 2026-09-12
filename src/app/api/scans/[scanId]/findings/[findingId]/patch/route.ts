import { NextResponse } from "next/server";
import { emitScanEvent, getScanRecord } from "@/server/store";
import { withFindingStatus } from "@/lib/findingState";

export async function POST(_request: Request, context: { params: Promise<{ scanId: string; findingId: string }> }) {
  const { scanId, findingId } = await context.params;
  const record = getScanRecord(scanId);
  const finding = record?.findings.find((item) => item.id === findingId);
  if (!record || !finding?.patch) {
    return NextResponse.json(
      { error: "The suggested patch could not be generated for this finding.", retry: true, demo: true },
      { status: 400 },
    );
  }

  emitScanEvent(record, {
    stage: "patching",
    label: "Preparing a reviewable fix.",
    progress: 96,
    status: "running",
    agent: "patch-planning",
  });
  record.findings = withFindingStatus(record.findings, findingId, "UNDER_REVIEW");
  emitScanEvent(record, {
    stage: "patching",
    label: "Suggested patch ready.",
    progress: 97,
    status: "complete",
    agent: "patch-planning",
  });

  const next = record.findings.find((item) => item.id === findingId);
  return NextResponse.json({
    finding: next,
    patch: next?.patch,
    patchExplanation: next?.patchExplanation,
    assumptions: ["The temporary demo copy is the only target."],
    recommendedTests: next?.relatedTest ? [next.relatedTest] : ["Add a regression test for the affected path."],
    limitations: next?.limitations ?? [],
  });
}
