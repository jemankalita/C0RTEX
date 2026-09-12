import { NextResponse } from "next/server";
import { getScanRecord } from "@/server/store";

export async function POST(_request: Request, context: { params: Promise<{ scanId: string; findingId: string }> }) {
  const { scanId, findingId } = await context.params;
  const record = getScanRecord(scanId);
  const finding = record?.findings.find((item) => item.id === findingId);
  if (!finding) {
    return NextResponse.json({ error: "Finding not found.", retry: true, demo: true }, { status: 404 });
  }
  return NextResponse.json({ finding, analysisMode: record.analysisMode });
}
