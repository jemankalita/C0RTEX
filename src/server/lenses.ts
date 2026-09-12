import type { LoadedRepository, RawFinding } from "@/server/types";

export const THREAT_LENSES = [
  "access-control",
  "injection",
  "browser-safety",
  "secrets",
  "configuration",
] as const;

export type ThreatLens = (typeof THREAT_LENSES)[number];
export type ScanMode = "auto" | "guided";

const LENS_RULES: Record<ThreatLens, string[]> = {
  "access-control": ["missing-object-auth"],
  injection: ["sql-injection"],
  "browser-safety": ["unsafe-html"],
  secrets: ["hardcoded-secret"],
  configuration: ["wildcard-cors"],
};

export function isThreatLens(value: string): value is ThreatLens {
  return (THREAT_LENSES as readonly string[]).includes(value);
}

export function selectThreatLenses(repository: LoadedRepository, findings: RawFinding[]): ThreatLens[] {
  const source = repository.files.map((file) => file.content).join("\n");
  const selected: ThreatLens[] = [];

  if (
    repository.files.some((file) => file.path.includes("routes")) ||
    /router\.(get|post|put|delete)/.test(source)
  ) {
    selected.push("access-control");
  }
  if (findings.some((finding) => finding.ruleId === "sql-injection") || /db\.query|SELECT /.test(source)) {
    selected.push("injection");
  }
  if (
    findings.some((finding) => finding.ruleId === "unsafe-html") ||
    /dangerouslySetInnerHTML|innerHTML/.test(source)
  ) {
    selected.push("browser-safety");
  }
  if (findings.some((finding) => finding.ruleId === "hardcoded-secret") || /sk_|API_KEY|SECRET|TOKEN/.test(source)) {
    selected.push("secrets");
  }
  if (findings.some((finding) => finding.ruleId === "wildcard-cors") || /origin:\s*"\*"/.test(source)) {
    selected.push("configuration");
  }

  return [...new Set(selected)];
}

export function findingsForLenses(findings: RawFinding[], lenses: ThreatLens[]) {
  const allowed = new Set(lenses.flatMap((lens) => LENS_RULES[lens]));
  return findings.filter((finding) => allowed.has(finding.ruleId));
}
