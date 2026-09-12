export type WorkflowStage = "MAP" | "TRACE" | "EXPLAIN" | "FIX" | "RECHECK";

export type RobotStatus =
  | "IDLE"
  | "READY TO SCAN"
  | "PATH DETECTED"
  | "MAPPING"
  | "TRACING"
  | "REASONING"
  | "PATCHING"
  | "RECHECKING";

export type WorkflowStep = {
  id: WorkflowStage;
  number: string;
  title: string;
  description: string;
  robotStatus: RobotStatus;
  caption: string;
};

export const WORKFLOW_FLOW = ["MAP", "TRACE", "EXPLAIN", "FIX", "RECHECK"] as const;

export const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: "MAP",
    number: "01",
    title: "MAP",
    description:
      "C0RTEX identifies routes, middleware, inputs, sinks, and sensitive operations.",
    robotStatus: "MAPPING",
    caption:
      "C0RTEX starts by mapping where an attacker could enter and what the application can reach.",
  },
  {
    id: "TRACE",
    number: "02",
    title: "TRACE",
    description: "It follows user-controlled data through the codebase.",
    robotStatus: "TRACING",
    caption: "It connects the suspicious line to the real application flow.",
  },
  {
    id: "EXPLAIN",
    number: "03",
    title: "EXPLAIN",
    description: "It turns a suspicious pattern into an application-specific attacker story.",
    robotStatus: "REASONING",
    caption: "Every finding explains what could happen in plain English.",
  },
  {
    id: "FIX",
    number: "04",
    title: "FIX",
    description: "It generates a minimal patch developers can inspect and approve.",
    robotStatus: "PATCHING",
    caption: "The output is a reviewable developer fix, not a generic security lecture.",
  },
  {
    id: "RECHECK",
    number: "05",
    title: "RECHECK",
    description: "It reruns the analysis and shows whether the risky path is gone.",
    robotStatus: "RECHECKING",
    caption: "C0RTEX shows whether the proposed fix removed the risky path.",
  },
];

export function robotStatusForStage(stage: WorkflowStage): RobotStatus {
  const step = WORKFLOW_STEPS.find((item) => item.id === stage);
  return step?.robotStatus ?? "IDLE";
}
