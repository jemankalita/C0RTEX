import { describe, expect, it } from "vitest";
import { resolveAnalysisMode } from "@/server/analysisMode";
import type { AgentResult } from "@/server/types";

const ok = (agent: string): AgentResult => ({ agent, status: "complete", summary: "done" });
const failed = (agent: string, error: string): AgentResult => ({
  agent,
  status: "failed",
  summary: "Agent failed and was skipped.",
  error,
});

describe("resolveAnalysisMode", () => {
  it("is demo when no provider is configured", () => {
    expect(resolveAnalysisMode(false, [ok("recon")])).toEqual({ mode: "demo", unavailableReason: null });
  });

  it("is live when at least one live agent completed", () => {
    expect(resolveAnalysisMode(true, [ok("recon"), failed("injection", "quota")])).toEqual({
      mode: "live",
      unavailableReason: null,
    });
  });

  it("falls back to demo with a reason when every live agent failed", () => {
    const result = resolveAnalysisMode(true, [
      failed("recon", "Gemini quota exceeded."),
      failed("review", "Gemini quota exceeded."),
    ]);
    expect(result.mode).toBe("demo");
    expect(result.unavailableReason).toBe("Gemini quota exceeded.");
  });

  it("treats an empty agent list as demo", () => {
    expect(resolveAnalysisMode(true, []).mode).toBe("demo");
  });
});
