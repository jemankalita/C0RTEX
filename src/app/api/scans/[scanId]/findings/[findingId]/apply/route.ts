import { NextResponse } from "next/server";
import { applyUnifiedHint } from "@/server/patch/applyUnifiedHint";
import { emitScanEvent, getScanRecord } from "@/server/store";
import { withFindingStatus } from "@/lib/findingState";

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
      { error: "Confirm that only the temporary demo copy should be modified.", retry: true, demo: true },
      { status: 400 },
    );
  }

  const record = getScanRecord(scanId);
  const finding = record?.findings.find((item) => item.id === findingId);
  if (!record || !finding?.patch) {
    return NextResponse.json(
      { error: "The suggested patch could not be applied cleanly to the temporary demo copy.", retry: true, demo: true },
      { status: 400 },
    );
  }

  const file = record.files.find((item) => item.path === finding.file);
  if (!file) {
    return NextResponse.json(
      { error: "The suggested patch could not be applied cleanly to the temporary demo copy.", retry: true, demo: true },
      { status: 400 },
    );
  }

  const applied = applyUnifiedHint(file.content, finding.patch);
  if (!applied.ok) {
    return NextResponse.json(
      { error: "The suggested patch could not be applied cleanly to the temporary demo copy.", retry: true, demo: true },
      { status: 400 },
    );
  }

  record.files = record.files.map((item) => (item.path === file.path ? { ...item, content: applied.content } : item));
  record.findings = withFindingStatus(record.findings, findingId, "PATCH_APPLIED");
  emitScanEvent(record, {
    stage: "patching",
    label: "Patch applied to the temporary demo copy.",
    progress: 98,
    status: "complete",
  });

  return NextResponse.json({
    finding: record.findings.find((item) => item.id === findingId),
    findings: record.findings,
  });
}
