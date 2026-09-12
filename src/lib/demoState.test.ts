import { describe, expect, it } from "vitest";
import { countBySeverity, DEMO_SCORE_AFTER, DEMO_SCORE_BEFORE } from "@/data/demoFindings";
import { robotStatusForStage, WORKFLOW_STEPS } from "@/data/workflowSteps";
import {
  expandFinding,
  generatePatch,
  INITIAL_DEMO_STATE,
  nextScanStage,
  recheckFinding,
  revealEvidence,
  viewAttackPath,
  visibleFindings,
} from "@/lib/demoState";
import { DEMO_FINDINGS } from "@/data/demoFindings";

describe("demo findings", () => {
  it("counts the labeled demo severities", () => {
    expect(countBySeverity(DEMO_FINDINGS)).toEqual({
      high: 2,
      medium: 2,
      low: 1,
    });
  });
});

describe("workflow stages", () => {
  it("maps each stage to a robot status", () => {
    expect(robotStatusForStage("MAP")).toBe("MAPPING");
    expect(robotStatusForStage("TRACE")).toBe("TRACING");
    expect(robotStatusForStage("EXPLAIN")).toBe("REASONING");
    expect(robotStatusForStage("FIX")).toBe("PATCHING");
    expect(robotStatusForStage("RECHECK")).toBe("RECHECKING");
    expect(WORKFLOW_STEPS).toHaveLength(5);
  });
});

describe("demo report state", () => {
  it("starts at the pre-patch safety score", () => {
    expect(INITIAL_DEMO_STATE.score).toBe(DEMO_SCORE_BEFORE);
    expect(INITIAL_DEMO_STATE.resolved).toBe(false);
  });

  it("toggles finding expansion without mutating the original state", () => {
    const next = expandFinding(INITIAL_DEMO_STATE, "missing-object-auth");
    expect(next.expandedFindingId).toBe("missing-object-auth");
    expect(INITIAL_DEMO_STATE.expandedFindingId).toBeNull();
    const closed = expandFinding(next, "missing-object-auth");
    expect(closed.expandedFindingId).toBeNull();
  });

  it("reveals the attack path tab", () => {
    const next = viewAttackPath(INITIAL_DEMO_STATE);
    expect(next.showAttackPath).toBe(true);
    expect(next.activeTab).toBe("path");
  });

  it("applies the demo patch and raises the score to 86", () => {
    const next = generatePatch(INITIAL_DEMO_STATE);
    expect(next.patched).toBe(true);
    expect(next.showPatch).toBe(true);
    expect(next.score).toBe(DEMO_SCORE_AFTER);
    expect(INITIAL_DEMO_STATE.score).toBe(DEMO_SCORE_BEFORE);
  });

  it("marks the primary finding resolved after recheck", () => {
    const next = recheckFinding(generatePatch(INITIAL_DEMO_STATE));
    expect(next.resolved).toBe(true);
    expect(next.score).toBe(DEMO_SCORE_AFTER);
    expect(visibleFindings(next.resolved)[0]?.title).toContain("resolved");
  });

  it("expands evidence on the primary finding", () => {
    const next = revealEvidence(INITIAL_DEMO_STATE);
    expect(next.showEvidence).toBe(true);
    expect(next.expandedFindingId).toBe("missing-object-auth");
  });
});

describe("scan stages", () => {
  it("advances from idle through complete", () => {
    expect(nextScanStage("idle")).toBe("mapping");
    expect(nextScanStage("mapping")).toBe("tracing");
    expect(nextScanStage("tracing")).toBe("reasoning");
    expect(nextScanStage("reasoning")).toBe("findings");
    expect(nextScanStage("findings")).toBe("complete");
    expect(nextScanStage("complete")).toBe("complete");
  });
});
