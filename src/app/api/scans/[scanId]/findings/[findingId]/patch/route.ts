import { NextResponse } from "next/server";
import { withFindingStatus } from "@/lib/findingState";
import { suggestPatch } from "@/lib/suggestPatch";
import { emitScanEvent, getScanRecord } from "@/server/store";

export async function POST(_request: Request, context: { params: Promise<{ scanId: string; findingId: string }> }) {
  const { scanId, findingId } = await context.params;
  const record = getScanRecord(scanId);
  const finding = record?.findings.find((item) => item.id === findingId);
  if (!record || !finding) {
    return NextResponse.json(
      { error: "The suggested patch could not be generated for this finding.", retry: true, demo: true },
      { status: 400 },
    );
  }

  const suggestion = suggestPatch(finding);
  if (!suggestion.patch.trim()) {
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

  record.findings = withFindingStatus(record.findings, findingId, "UNDER_REVIEW").map((item) =>
    item.id === findingId
      ? { ...item, patch: suggestion.patch, patchExplanation: suggestion.patchExplanation }
      : item,
  );
  if (record.report) {
    record.report = { ...record.report, findings: record.findings };
  }

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
    assumptions: [
      "C0RTEX applies confirmed patches only to this scan's working copy, not to GitHub.",
      "Download the patched file and commit it in the real repository after review.",
    ],
    recommendedTests: next?.relatedTest ? [next.relatedTest] : ["Add a regression test for the affected path."],
    limitations: next?.limitations ?? [],
  });
}
