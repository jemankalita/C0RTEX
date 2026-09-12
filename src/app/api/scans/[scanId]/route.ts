import { NextResponse } from "next/server";
import { getScanRecord } from "@/server/store";

export async function GET(_request: Request, context: { params: Promise<{ scanId: string }> }) {
  const { scanId } = await context.params;
  const record = getScanRecord(scanId);
  if (!record) {
    return NextResponse.json({ error: "Scan not found.", retry: true, demo: true }, { status: 404 });
  }
  return NextResponse.json({
    scanId: record.id,
    status: record.status,
    progress: record.progress,
    analysisMode: record.analysisMode,
    error: record.error,
  });
}
