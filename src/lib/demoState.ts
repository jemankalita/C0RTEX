import {
  DEMO_FINDINGS,
  DEMO_SCORE_AFTER,
  DEMO_SCORE_BEFORE,
  PRIMARY_FINDING_ID,
  type DemoFinding,
} from "@/data/demoFindings";

export type DemoReportState = {
  isDemo: true;
  patched: boolean;
  resolved: boolean;
  score: number;
  expandedFindingId: string | null;
  showAttackPath: boolean;
  showPatch: boolean;
  showEvidence: boolean;
  activeTab: "findings" | "path" | "score" | "patch";
};

export const INITIAL_DEMO_STATE: DemoReportState = {
  isDemo: true,
  patched: false,
  resolved: false,
  score: DEMO_SCORE_BEFORE,
  expandedFindingId: null,
  showAttackPath: false,
  showPatch: false,
  showEvidence: false,
  activeTab: "findings",
};

export function expandFinding(
  state: DemoReportState,
  findingId: string,
): DemoReportState {
  const nextId = state.expandedFindingId === findingId ? null : findingId;
  return {
    ...state,
    expandedFindingId: nextId,
  };
}

export function viewAttackPath(state: DemoReportState): DemoReportState {
  return {
    ...state,
    showAttackPath: true,
    activeTab: "path",
  };
}

export function generatePatch(state: DemoReportState): DemoReportState {
  return {
    ...state,
    patched: true,
    showPatch: true,
    activeTab: "patch",
    score: DEMO_SCORE_AFTER,
  };
}

export function recheckFinding(state: DemoReportState): DemoReportState {
  return {
    ...state,
    patched: true,
    resolved: true,
    showPatch: true,
    score: DEMO_SCORE_AFTER,
    activeTab: "score",
  };
}

export function revealEvidence(state: DemoReportState): DemoReportState {
  return {
    ...state,
    showEvidence: true,
    expandedFindingId: state.expandedFindingId ?? PRIMARY_FINDING_ID,
  };
}

export function visibleFindings(resolved: boolean): DemoFinding[] {
  if (!resolved) {
    return DEMO_FINDINGS;
  }

  return DEMO_FINDINGS.map((finding) =>
    finding.id === PRIMARY_FINDING_ID
      ? { ...finding, title: `${finding.title} (resolved)` }
      : finding,
  );
}

export type ScanStage =
  | "idle"
  | "mapping"
  | "tracing"
  | "reasoning"
  | "findings"
  | "complete";

export const SCAN_STAGE_ORDER: ScanStage[] = [
  "mapping",
  "tracing",
  "reasoning",
  "findings",
  "complete",
];

export function nextScanStage(stage: ScanStage): ScanStage {
  if (stage === "idle") return "mapping";
  const index = SCAN_STAGE_ORDER.indexOf(stage);
  if (index === -1 || index === SCAN_STAGE_ORDER.length - 1) {
    return "complete";
  }
  return SCAN_STAGE_ORDER[index + 1];
}
