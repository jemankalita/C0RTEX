import type { ScanStatus } from "@/types/security";

export type ScanStage = {
  id: ScanStatus;
  label: string;
  explanation: string;
  robotStatus: string;
  durationMs: number;
};

export const SCAN_STAGES: ScanStage[] = [
  {
    id: "preparing",
    label: "Repository prepared",
    explanation: "Preparing the authorized demo repository for analysis.",
    robotStatus: "PREPARING",
    durationMs: 1400,
  },
  {
    id: "mapping",
    label: "Application structure mapped",
    explanation: "Finding routes, middleware, inputs, and sensitive operations.",
    robotStatus: "MAPPING",
    durationMs: 1600,
  },
  {
    id: "tracing",
    label: "Public routes identified",
    explanation: "Identifying public routes and authentication boundaries.",
    robotStatus: "TRACING",
    durationMs: 1500,
  },
  {
    id: "reasoning",
    label: "User-controlled inputs traced",
    explanation: "Connecting user-controlled inputs to sensitive sinks.",
    robotStatus: "REASONING",
    durationMs: 1800,
  },
  {
    id: "scoring",
    label: "Sensitive sinks analyzed",
    explanation: "Estimating exposure, severity, and safety-score impact.",
    robotStatus: "SCORING",
    durationMs: 1500,
  },
  {
    id: "report_ready",
    label: "Threat report generated",
    explanation: "The scan is complete. Review the findings below.",
    robotStatus: "REPORT READY",
    durationMs: 1200,
  },
];

export const SCAN_TIMELINE_LABELS = [
  "Repository prepared",
  "Application structure mapped",
  "Public routes identified",
  "Authentication boundaries checked",
  "User-controlled inputs traced",
  "Sensitive sinks analyzed",
  "Threat report generated",
] as const;

export function isScanning(status: ScanStatus): boolean {
  return (
    status === "preparing" ||
    status === "mapping" ||
    status === "tracing" ||
    status === "reasoning" ||
    status === "scoring"
  );
}

export function stageIndex(status: ScanStatus): number {
  return SCAN_STAGES.findIndex((stage) => stage.id === status);
}

export function nextStage(status: ScanStatus): ScanStatus {
  const index = stageIndex(status);
  if (index === -1 || index === SCAN_STAGES.length - 1) {
    return "report_ready";
  }
  return SCAN_STAGES[index + 1].id;
}
