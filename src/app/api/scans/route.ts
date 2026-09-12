import { NextResponse } from "next/server";
import { runSecurityAnalysis } from "@/server/orchestrator";
import { createScanRecord } from "@/server/store";

export async function POST(request: Request) {
  let body: { source?: string; repositoryId?: string; authorized?: boolean };
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

  if (body.source && body.source !== "demo") {
    return NextResponse.json(
      {
        error: "This build analyzes the included demo repository. ZIP and GitHub ingestion stay in demo fallback.",
        retry: true,
        demo: true,
      },
      { status: 400 },
    );
  }

  const record = createScanRecord(true);
  await runSecurityAnalysis(record.id);
  return NextResponse.json({ scanId: record.id, status: record.status });
}
