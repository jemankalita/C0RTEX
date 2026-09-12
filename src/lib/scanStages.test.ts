import { describe, expect, it } from "vitest";
import { isScanning, nextStage, SCAN_STAGES, stageIndex } from "@/lib/scanStages";

describe("scan stages", () => {
  it("uses the demo timings", () => {
    expect(SCAN_STAGES.map((stage) => stage.durationMs)).toEqual([600, 900, 700, 900, 700, 900]);
  });

  it("advances through the scan until the report is ready", () => {
    expect(nextStage("preparing")).toBe("mapping");
    expect(nextStage("mapping")).toBe("tracing");
    expect(nextStage("scoring")).toBe("report_ready");
    expect(nextStage("report_ready")).toBe("report_ready");
  });

  it("treats mid-scan states as scanning", () => {
    expect(isScanning("mapping")).toBe(true);
    expect(isScanning("report_ready")).toBe(false);
    expect(stageIndex("reasoning")).toBeGreaterThan(0);
  });
});
