import { NextResponse } from "next/server";
import { isThreatLens, type ScanMode, type ThreatLens } from "@/server/lenses";
import { runSecurityAnalysis } from "@/server/orchestrator";
import { createScanRecord } from "@/server/store";

export async function POST(request: Request) {
  let body: {
    source?: string;
    repositoryId?: string;
    authorized?: boolean;
    mode?: ScanMode;
    lenses?: string[];
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request body.", retry: true, demo: true }, { status: 400 });
  }

  if (!body.authorized) {
    return NextResponse.json(
      { error: "Authorization is required before a scan can start.", retry: true, demo: true },
      { status: 400 },
    );
  }

  const mode: ScanMode = body.mode === "guided" ? "guided" : "auto";
  const lenses: ThreatLens[] = (body.lenses ?? []).filter(isThreatLens);

  const record = createScanRecord(true, mode, lenses);
  await runSecurityAnalysis(record.id);
  return NextResponse.json({ scanId: record.id, status: record.status });
}
