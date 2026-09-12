import { NextResponse } from "next/server";
import { getScanRecord } from "@/server/store";

export async function GET(_request: Request, context: { params: Promise<{ scanId: string }> }) {
  const { scanId } = await context.params;
  const record = getScanRecord(scanId);
  if (!record?.report) {
    return NextResponse.json({ error: "Report is not ready.", retry: true, demo: true }, { status: 404 });
  }
  return NextResponse.json(record.report);
}
