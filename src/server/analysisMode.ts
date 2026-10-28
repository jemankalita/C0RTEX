import type { AgentResult, AnalysisMode } from "@/server/types";

// A scan only counts as live if at least one live agent actually completed.
export function resolveAnalysisMode(
  hasProvider: boolean,
  agents: AgentResult[],
): { mode: AnalysisMode; unavailableReason: string | null } {
  if (!hasProvider) return { mode: "demo", unavailableReason: null };
  if (agents.some((agent) => agent.status !== "failed")) return { mode: "live", unavailableReason: null };
  const reason = agents.find((agent) => agent.error)?.error ?? "Every live agent failed.";
  return { mode: "demo", unavailableReason: reason };
}
