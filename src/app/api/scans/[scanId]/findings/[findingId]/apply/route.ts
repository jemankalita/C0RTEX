import { NextResponse } from "next/server";
import { withFindingStatus } from "@/lib/findingState";
import { suggestPatch } from "@/lib/suggestPatch";
import { applyUnifiedHint } from "@/server/patch/applyUnifiedHint";
import { emitScanEvent, getScanRecord } from "@/server/store";

export async function POST(request: Request, context: { params: Promise<{ scanId: string; findingId: string }> }) {
  const { scanId, findingId } = await context.params;
  let confirmed = false;
  try {
    const body = (await request.json()) as { confirmed?: boolean };
    confirmed = Boolean(body.confirmed);
  } catch {
    confirmed = false;
  }
  if (!confirmed) {
    return NextResponse.json(
      { error: "Confirm that only this scan's working copy should be modified.", retry: true, demo: true },
      { status: 400 },
    );
  }

  const record = getScanRecord(scanId);
  const finding = record?.findings.find((item) => item.id === findingId);
  if (!record || !finding) {
    return NextResponse.json(
      { error: "The suggested patch could not be applied cleanly to the scan working copy.", retry: true, demo: true },
      { status: 400 },
    );
  }

  const suggestion = suggestPatch(finding);
  const file = record.files.find((item) => item.path === finding.file);
  if (!file || !suggestion.patch.trim()) {
    return NextResponse.json(
      { error: "The suggested patch could not be applied cleanly to the scan working copy.", retry: true, demo: true },
      { status: 400 },
    );
  }

  const applied = applyUnifiedHint(file.content, suggestion.patch);
  if (!applied.ok) {
    return NextResponse.json(
      { error: "The suggested patch could not be applied cleanly to the scan working copy.", retry: true, demo: true },
      { status: 400 },
    );
  }

  record.files = record.files.map((item) => (item.path === file.path ? { ...item, content: applied.content } : item));
  record.patchedPaths = record.patchedPaths.includes(file.path)
    ? record.patchedPaths
    : [...record.patchedPaths, file.path];
  record.findings = withFindingStatus(record.findings, findingId, "PATCH_APPLIED").map((item) =>
    item.id === findingId
      ? { ...item, patch: suggestion.patch, patchExplanation: suggestion.patchExplanation }
      : item,
  );
  if (record.report) {
    record.report = { ...record.report, findings: record.findings };
  }
  emitScanEvent(record, {
    stage: "patching",
    label: "Patch applied to the scan working copy.",
    progress: 98,
    status: "complete",
  });

  return NextResponse.json({
    finding: record.findings.find((item) => item.id === findingId),
    findings: record.findings,
    patchedFile: { path: file.path, content: applied.content },
  });
}
