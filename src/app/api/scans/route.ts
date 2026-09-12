import { NextResponse } from "next/server";
import { isValidGitHubRepoUrl } from "@/lib/githubUrl";
import { isThreatLens, type ScanMode, type ThreatLens } from "@/server/lenses";
import { ensureScanStarted } from "@/server/orchestrator";
import { createScanRecord } from "@/server/store";

export async function POST(request: Request) {
  let body: {
    source?: string;
    repositoryId?: string;
    githubUrl?: string;
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

  const source = body.source === "github" ? "github" : "demo";
  if (source === "github" && (!body.githubUrl || !isValidGitHubRepoUrl(body.githubUrl))) {
    return NextResponse.json(
      { error: "Enter a valid GitHub repository URL.", retry: true, demo: false },
      { status: 400 },
    );
  }

  const mode: ScanMode = body.mode === "guided" ? "guided" : "auto";
  const lenses: ThreatLens[] = (body.lenses ?? []).filter(isThreatLens);

  const record = createScanRecord(true, mode, lenses, source, body.githubUrl);
  ensureScanStarted(record.id);
  return NextResponse.json({ scanId: record.id, status: record.status });
}
