import { NextResponse } from "next/server";
import { scanFileForRule } from "@/server/scanner/scanRepository";
import { emitScanEvent, getScanRecord } from "@/server/store";
import { withFindingStatus } from "@/lib/findingState";

export async function POST(_request: Request, context: { params: Promise<{ scanId: string; findingId: string }> }) {
  const { scanId, findingId } = await context.params;
  const record = getScanRecord(scanId);
  const finding = record?.findings.find((item) => item.id === findingId);
  if (!record || !finding) {
    return NextResponse.json({ error: "The recheck could not run.", retry: true, demo: true }, { status: 404 });
  }

  emitScanEvent(record, {
    stage: "rechecking",
    label: "Rechecking the selected path.",
    progress: 99,
    status: "running",
  });

  const file = record.files.find((item) => item.path === finding.file);
  const stillPresent = file ? scanFileForRule(file.path, file.content, finding.id) : true;
  if (stillPresent && finding.status !== "PATCH_APPLIED") {
    emitScanEvent(record, {
      stage: "rechecking",
      label: "The selected finding is still present.",
      progress: 99,
      status: "partial",
    });
    return NextResponse.json({
      resolved: false,
      findings: record.findings,
      message: "The selected finding is still open. Apply the temporary patch before rechecking.",
    });
  }

  record.findings = withFindingStatus(record.findings, findingId, "RESOLVED");
  emitScanEvent(record, {
    stage: "resolved",
    label: "Selected finding resolved.",
    progress: 100,
    status: "complete",
  });

  return NextResponse.json({
    resolved: true,
    findings: record.findings,
    message: "Finding resolved. Only the selected path was rechecked.",
  });
}
