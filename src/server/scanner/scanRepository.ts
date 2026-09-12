import type { LoadedRepository, RawFinding } from "@/server/types";

type Rule = {
  id: string;
  title: string;
  category: string;
  confidence: number;
  test: (file: string, line: string, content: string) => boolean;
  extras?: (file: string, line: string) => Partial<RawFinding>;
};

const RULES: Rule[] = [
  {
    id: "missing-object-auth",
    title: "Missing object authorization",
    category: "Broken Access Control",
    confidence: 0.93,
    test: (_file, line, content) =>
      line.includes("findById(req.params.id)") && content.includes("requireAuth"),
    extras: () => ({
      route: "/api/orders/:id",
      source: "req.params.id",
      sink: "Order.findById",
    }),
  },
  {
    id: "sql-injection",
    title: "Possible SQL injection",
    category: "Injection",
    confidence: 0.88,
    test: (_file, line) =>
      /query\(`[^`]*\$\{req\.(query|body|params)\./.test(line) ||
      /LIKE '%\$\{req\.query/.test(line),
    extras: () => ({
      route: "/api/search",
      source: "req.query.q",
      sink: "db.query",
    }),
  },
  {
    id: "wildcard-cors",
    title: "Wildcard CORS configuration",
    category: "Security Misconfiguration",
    confidence: 0.81,
    test: (file, line) => file.includes("cors") && line.includes('origin: "*"'),
  },
  {
    id: "hardcoded-secret",
    title: "Hardcoded service secret",
    category: "Cryptographic/Secret Management",
    confidence: 0.9,
    test: (_file, line) => /sk_[a-zA-Z0-9_]+/.test(line) || /apiKey:\s*["']sk_/.test(line),
    extras: () => ({ sink: "PaymentClient" }),
  },
  {
    id: "unsafe-html",
    title: "Unsafe HTML rendering",
    category: "Injection/XSS",
    confidence: 0.76,
    test: (_file, line) => line.includes("dangerouslySetInnerHTML"),
    extras: () => ({ sink: "dangerouslySetInnerHTML" }),
  },
];

export function scanRepository(repository: LoadedRepository): RawFinding[] {
  const findings: RawFinding[] = [];

  for (const file of repository.files) {
    const lines = file.content.split(/\r?\n/);
    lines.forEach((line, index) => {
      for (const rule of RULES) {
        if (!rule.test(file.path, line, file.content)) continue;
        if (findings.some((item) => item.id === rule.id)) continue;
        findings.push({
          id: rule.id,
          ruleId: rule.id,
          category: rule.category,
          title: rule.title,
          file: file.path,
          startLine: index + 1,
          endLine: index + 1,
          snippet: line.trim(),
          confidence: rule.confidence,
          ...rule.extras?.(file.path, line),
        });
      }
    });
  }

  return findings;
}

export function scanFileForRule(filePath: string, content: string, ruleId: string) {
  const fakeRepo: LoadedRepository = {
    id: "temp",
    name: "temp",
    language: "TypeScript",
    files: [{ path: filePath, content }],
    metadata: { language: "TypeScript", fileCount: 1 },
  };
  return scanRepository(fakeRepo).some((finding) => finding.ruleId === ruleId);
}
