import { NextResponse } from "next/server";
import { applyUnifiedHint } from "@/lib/applyUnifiedHint";
import { suggestPatch } from "@/lib/suggestPatch";
import { getScanRecord } from "@/server/store";

export async function GET(_request: Request, context: { params: Promise<{ scanId: string; findingId: string }> }) {
  const { scanId, findingId } = await context.params;
  const record = getScanRecord(scanId);
  const finding = record?.findings.find((item) => item.id === findingId);
  if (!record || !finding) {
    return NextResponse.json({ error: "The generated fix could not be saved.", retry: true }, { status: 404 });
  }

  const file = record.files.find((item) => item.path === finding.file);
  const suggestion = suggestPatch(finding, file?.content);
  const applied = file && suggestion.patch ? applyUnifiedHint(file.content, suggestion.patch) : { ok: false as const };

  return NextResponse.json({
    path: finding.file,
    patch: suggestion.patch,
    patchExplanation: suggestion.patchExplanation,
    originalContent: file?.content ?? finding.codeBefore ?? "",
    patchedContent: applied.ok ? applied.content : file?.content ?? finding.codeBefore ?? suggestion.patch,
  });
}
