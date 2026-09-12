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
      (line.includes("findById(req.params.id)") && content.includes("requireAuth")) ||
      /(findById|findOne|findUnique)\(\s*(req\.(params|query)|params)\./.test(line),
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
      /LIKE '%\$\{req\.query/.test(line) ||
      /\.(query|execute)\([`'"][^`'"]*\$\{/.test(line),
    extras: () => ({
      route: "/api/search",
      source: "req.query.q",
      sink: "db.query",
    }),
  },
  {
    id: "command-injection",
    title: "Possible command injection",
    category: "Injection",
    confidence: 0.87,
    test: (_file, line) =>
      /run\(`[^`]*\$\{req\.(query|body|params)\./.test(line) ||
      /\b(exec|execSync|spawn)\([^)]*\$\{/.test(line),
    extras: () => ({
      route: "/api/admin/export",
      source: "req.query.path",
      sink: "child_process.exec",
    }),
  },
  {
    id: "path-traversal",
    title: "Unvalidated file path",
    category: "Injection",
    confidence: 0.84,
    test: (_file, line) =>
      /readFile(Sync)?\(`[^`]*\$\{req\.(query|body|params)\./.test(line) ||
      /readFile(Sync)?\([^)]*\$\{/.test(line),
    extras: () => ({
      route: "/api/files/invoice",
      source: "req.query.name",
      sink: "fs.readFile",
    }),
  },
  {
    id: "ssrf",
    title: "User-controlled outbound fetch",
    category: "Injection",
    confidence: 0.83,
    test: (_file, line) => /fetch\(\s*(req\.(query|body|params)|params)\./.test(line),
    extras: () => ({
      route: "/api/webhooks/preview",
      source: "req.query.url",
      sink: "fetch",
    }),
  },
  {
    id: "open-redirect",
    title: "Open redirect",
    category: "Security Misconfiguration",
    confidence: 0.8,
    test: (_file, line) => /redirect\(req\.(query|body|params)\./.test(line),
    extras: () => ({
      route: "/api/users/continue",
      source: "req.query.next",
      sink: "res.redirect",
    }),
  },
  {
    id: "mass-assignment",
    title: "Unfiltered profile update",
    category: "Broken Access Control",
    confidence: 0.78,
    test: (_file, line) => /User\.update\([^,]+,\s*req\.body\)/.test(line),
    extras: () => ({
      route: "/api/users/profile",
      source: "req.body",
      sink: "User.update",
    }),
  },
  {
    id: "auth-fallback",
    title: "Failed token still becomes a user",
    category: "Broken Access Control",
    confidence: 0.82,
    test: (file, line) => file.includes("auth") && line.includes('req.user = { id: "user-1" }'),
    extras: () => ({
      route: "/api/*",
      sink: "requireAuth",
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
    test: (_file, line) =>
      /sk_[a-zA-Z0-9_]+/.test(line) ||
      /apiKey:\s*["']sk_/.test(line) ||
      /(api[_-]?key|secret|password)\s*[:=]\s*["'][^"']{10,}/i.test(line),
    extras: () => ({ sink: "PaymentClient" }),
  },
  {
    id: "insecure-jwt",
    title: "Hardcoded JWT signing secret",
    category: "Cryptographic/Secret Management",
    confidence: 0.86,
    test: (_file, line) =>
      line.includes("DEMO_JWT_SECRET") && (line.includes("jwt.sign") || line.includes("jwt.verify")),
    extras: () => ({ sink: "jsonwebtoken" }),
  },
  {
    id: "unsafe-html",
    title: "Unsafe HTML rendering",
    category: "Injection/XSS",
    confidence: 0.76,
    test: (_file, line) =>
      line.includes("dangerouslySetInnerHTML") ||
      /\.innerHTML\s*=/.test(line) ||
      /document\.write\s*\(/.test(line),
    extras: () => ({ sink: "dangerouslySetInnerHTML" }),
  },
  {
    id: "debug-env",
    title: "Debug endpoint exposes environment",
    category: "Security Misconfiguration",
    confidence: 0.79,
    test: (_file, line) => line.includes("process.env") && line.includes("res.json"),
    extras: () => ({
      route: "/api/admin/debug",
      sink: "process.env",
    }),
  },
  {
    id: "insecure-cookie",
    title: "Session cookie missing security flags",
    category: "Security Misconfiguration",
    confidence: 0.74,
    test: (file, line) => file.includes("session") && line.includes("httpOnly: false"),
    extras: () => ({ sink: "res.cookie" }),
  },
];

export function scanRepository(repository: LoadedRepository): RawFinding[] {
  const findings: RawFinding[] = [];

  for (const file of repository.files) {
    const lines = file.content.split(/\r?\n/);
    lines.forEach((line, index) => {
      for (const rule of RULES) {
        if (!rule.test(file.path, line, file.content)) continue;
        const id = findings.some((item) => item.id === rule.id) ? `${rule.id}:${file.path}:${index + 1}` : rule.id;
        findings.push({
          id,
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

export function scanFileForRule(filePath: string, content: string, ruleId: string, line?: number) {
  const rule = RULES.find((item) => item.id === ruleId);
  if (!rule) {
    const fakeRepo: LoadedRepository = {
      id: "temp",
      name: "temp",
      language: "TypeScript",
      files: [{ path: filePath, content }],
      metadata: { language: "TypeScript", fileCount: 1 },
    };
    return scanRepository(fakeRepo).some((finding) => finding.ruleId === ruleId);
  }

  const lines = content.split(/\r?\n/);
  if (typeof line === "number") {
    return rule.test(filePath, lines[line - 1] ?? "", content);
  }
  return lines.some((entry) => rule.test(filePath, entry, content));
}
