import { NextResponse } from "next/server";
import { getScanRecord } from "@/server/store";

export async function GET(_request: Request, context: { params: Promise<{ scanId: string }> }) {
  const { scanId } = await context.params;
  const record = getScanRecord(scanId);
  if (!record) {
    return NextResponse.json({ error: "Scan not found.", retry: true, demo: true }, { status: 404 });
  }

  const files = record.files
    .filter((file) => record.patchedPaths.includes(file.path))
    .map((file) => ({ path: file.path, content: file.content }));

  return NextResponse.json({
    repositoryName: record.report?.repositoryName ?? record.githubUrl ?? "working-copy",
    files,
  });
}
