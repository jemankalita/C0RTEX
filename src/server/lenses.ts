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
  "access-control": ["missing-object-auth", "mass-assignment", "auth-fallback"],
  injection: ["sql-injection", "command-injection", "path-traversal", "ssrf"],
  "browser-safety": ["unsafe-html", "open-redirect"],
  secrets: ["hardcoded-secret", "insecure-jwt"],
  configuration: ["wildcard-cors", "debug-env", "insecure-cookie"],
};

export function isThreatLens(value: string): value is ThreatLens {
  return (THREAT_LENSES as readonly string[]).includes(value);
}

export function selectThreatLenses(repository: LoadedRepository, findings: RawFinding[]): ThreatLens[] {
  const source = repository.files.map((file) => file.content).join("\n");
  const selected: ThreatLens[] = [];

  if (
    findings.some((finding) => LENS_RULES["access-control"].includes(finding.ruleId)) ||
    repository.files.some((file) => file.path.includes("routes")) ||
    /router\.(get|post|put|delete)|export (async )?function (GET|POST)/.test(source)
  ) {
    selected.push("access-control");
  }
  if (
    findings.some((finding) => LENS_RULES.injection.includes(finding.ruleId)) ||
    /db\.query|SELECT |exec\(|readFile|fetch\(/.test(source)
  ) {
    selected.push("injection");
  }
  if (
    findings.some((finding) => LENS_RULES["browser-safety"].includes(finding.ruleId)) ||
    /dangerouslySetInnerHTML|innerHTML|document\.write/.test(source)
  ) {
    selected.push("browser-safety");
  }
  if (
    findings.some((finding) => LENS_RULES.secrets.includes(finding.ruleId)) ||
    /sk_|API_KEY|SECRET|TOKEN|AIza/.test(source)
  ) {
    selected.push("secrets");
  }
  if (
    findings.some((finding) => LENS_RULES.configuration.includes(finding.ruleId)) ||
    /origin:\s*"\*"/.test(source)
  ) {
    selected.push("configuration");
  }

  return selected.length > 0 ? [...new Set(selected)] : [...THREAT_LENSES];
}

export function findingsForLenses(findings: RawFinding[], lenses: ThreatLens[]) {
  if (lenses.length === 0) return findings;
  const allowed = new Set(lenses.flatMap((lens) => LENS_RULES[lens]));
  const scoped = findings.filter((finding) => allowed.has(finding.ruleId));
  return scoped.length > 0 ? scoped : findings;
}
