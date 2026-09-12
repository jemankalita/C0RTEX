import type { SecurityFinding } from "@/types/security";

export function createDemoFindings(): SecurityFinding[] {
  return [
    {
      id: "missing-object-auth",
      title: "Missing object authorization",
      category: "Broken Access Control",
      severity: "HIGH",
      status: "OPEN",
      file: "src/routes/orders.ts",
      line: 18,
      locationLabel: "/api/orders/:id",
      confidence: 93,
      reachability: "Authenticated route",
      scoreImpact: -18,
      whyItMatters:
        "A logged-in user may be able to access another user's order by changing the order ID in the URL. The route checks authentication but does not verify that the requested order belongs to the current user.",
      attackerStory:
        "An attacker does not need to bypass login. They can use a valid account, change the order ID in the request, and potentially retrieve another user's order because the database query checks only the order ID.",
      evidence: [
        "The route accepts an order ID directly from the URL.",
        "The route contains authentication middleware but no ownership check.",
        "The database query filters only by order ID.",
        "No test verifies cross-user access restrictions.",
      ],
      limitations: [
        "Static analysis cannot verify whether global middleware exists outside the provided file.",
        "The demo does not perform live exploitation.",
        "Production configuration was not inspected.",
      ],
      codeBefore: `router.get("/orders/:id", requireAuth, async (req, res) => {
  const order = await Order.findById(req.params.id);
  res.json(order);
});`,
      highlightTerms: ["req.params.id", "Order.findById(req.params.id)"],
      relatedTest: "tests/orders.test.ts",
      relatedTestExcerpt: `it("returns an order for an authenticated user", async () => {
  const response = await request(app).get("/api/orders/1").set("Authorization", token);
  expect(response.status).toBe(200);
});`,
      patch: `- const order = await Order.findById(req.params.id);
+ const order = await Order.findOne({
+   _id: req.params.id,
+   userId: req.user.id
+ });`,
      patchExplanation:
        "The query now requires both the requested order ID and the authenticated user's ID, preventing access to another user's order through ID manipulation.",
      attackPath: [
        {
          id: "entry",
          label: "GET /api/orders/:id",
          type: "entry",
          file: "src/routes/orders.ts",
          line: 18,
          description: "Route exposes user-controlled order ID.",
          status: "discovered",
        },
        {
          id: "input",
          label: "req.params.id",
          type: "input",
          file: "src/routes/orders.ts",
          line: 19,
          description: "Order identifier is taken from the URL without ownership context.",
          status: "suspicious",
        },
        {
          id: "handler",
          label: "Order.findById(id)",
          type: "handler",
          file: "src/routes/orders.ts",
          line: 19,
          description: "Handler looks up the order by identifier only.",
          status: "suspicious",
        },
        {
          id: "missing",
          label: "No ownership check",
          type: "missing-control",
          file: "src/routes/orders.ts",
          line: 19,
          description: "Authentication is present, but object-level authorization is missing.",
          status: "risky",
        },
        {
          id: "impact",
          label: "Another user's order data",
          type: "impact",
          file: "src/services/database.ts",
          line: 41,
          description: "The response may include another customer's order details.",
          status: "risky",
        },
      ],
    },
    {
      id: "sql-injection",
      title: "Possible SQL injection",
      category: "Injection",
      severity: "HIGH",
      status: "OPEN",
      file: "src/routes/search.ts",
      line: 12,
      locationLabel: "/api/search",
      confidence: 88,
      reachability: "Public route",
      scoreImpact: -14,
      whyItMatters:
        "A public search route passes user-controlled query text into a raw SQL string. An attacker may alter query behavior and retrieve unintended records.",
      attackerStory:
        "A public search route passes user-controlled query text into a raw SQL string. An attacker may alter query behavior and retrieve unintended records.",
      evidence: [
        "Input originates from req.query.q.",
        "Input is inserted into a SQL template string.",
        "Query is executed without parameter binding.",
        "Route is publicly reachable.",
      ],
      limitations: [
        "The demo does not execute the query against a live database.",
        "ORM wrappers outside this file were not inspected.",
      ],
      codeBefore: `router.get("/search", async (req, res) => {
  const rows = await db.query(\`SELECT * FROM products WHERE name LIKE '%\${req.query.q}%'\`);
  res.json(rows);
});`,
      highlightTerms: ["req.query.q"],
      patch: `- const rows = await db.query(\`SELECT * FROM products WHERE name LIKE '%\${req.query.q}%'\`);
+ const rows = await db.query("SELECT * FROM products WHERE name LIKE ?", [\`%\${req.query.q}%\`]);`,
      patchExplanation: "Use a parameterized query so user input cannot change the SQL structure.",
      attackPath: [
        {
          id: "entry",
          label: "GET /api/search",
          type: "entry",
          status: "discovered",
          file: "src/routes/search.ts",
          line: 12,
          description: "Public search endpoint accepts query text.",
        },
        {
          id: "input",
          label: "req.query.q",
          type: "input",
          status: "suspicious",
          file: "src/routes/search.ts",
          line: 13,
        },
        {
          id: "sink",
          label: "Raw SQL template",
          type: "sink",
          status: "risky",
          file: "src/services/database.ts",
          line: 22,
        },
        {
          id: "impact",
          label: "Unintended records",
          type: "impact",
          status: "risky",
        },
      ],
    },
    {
      id: "wildcard-cors",
      title: "Wildcard CORS configuration",
      category: "Security Misconfiguration",
      severity: "MEDIUM",
      status: "OPEN",
      file: "src/config/cors.ts",
      line: 4,
      locationLabel: "src/config/cors.ts",
      confidence: 81,
      reachability: "Global configuration",
      scoreImpact: -8,
      whyItMatters:
        "The server allows requests from any origin. The impact depends on authentication, cookies, and whether sensitive responses are exposed cross-origin.",
      attackerStory:
        "The server allows requests from any origin. The impact depends on authentication, cookies, and whether sensitive responses are exposed cross-origin.",
      evidence: [
        'CORS origin is set to "*".',
        "Configuration is applied globally.",
        "Sensitive routes may inherit the setting.",
      ],
      limitations: [
        "Browser credential behavior was not verified in a live environment.",
        "CDN or gateway CORS overrides were not inspected.",
      ],
      codeBefore: `export const corsOptions = {
  origin: "*",
  credentials: true,
};`,
      highlightTerms: ['"*"'],
      patch: `- origin: "*",
+ origin: ["https://shop.example.com"],`,
      patchExplanation: "Restrict allowed origins and review credential settings.",
      attackPath: [
        {
          id: "entry",
          label: "Global CORS config",
          type: "entry",
          status: "discovered",
          file: "src/config/cors.ts",
          line: 4,
        },
        {
          id: "missing",
          label: "origin: *",
          type: "missing-control",
          status: "suspicious",
          file: "src/config/cors.ts",
          line: 4,
        },
        {
          id: "impact",
          label: "Cross-origin data exposure",
          type: "impact",
          status: "risky",
        },
      ],
    },
    {
      id: "hardcoded-secret",
      title: "Hardcoded service secret",
      category: "Cryptographic/Secret Management",
      severity: "MEDIUM",
      status: "OPEN",
      file: "src/services/payment.ts",
      line: 7,
      locationLabel: "src/services/payment.ts",
      confidence: 90,
      reachability: "Tracked source file",
      scoreImpact: -7,
      whyItMatters:
        "A service credential is embedded in source code. If the repository is exposed, the credential may be reused against the external service.",
      attackerStory:
        "A service credential is embedded in source code. If the repository is exposed, the credential may be reused against the external service.",
      evidence: [
        "Secret-like value is present in a tracked source file.",
        "Value is used by a payment-service client.",
        "Environment-based configuration is not visible.",
      ],
      limitations: [
        "The demo uses a fake credential only.",
        "Secret rotation status cannot be verified from source.",
      ],
      codeBefore: `const client = new PaymentClient({
  apiKey: "sk_demo_not_a_real_secret_123",
});`,
      highlightTerms: ["sk_demo_not_a_real_secret_123"],
      patch: `- apiKey: "sk_demo_not_a_real_secret_123",
+ apiKey: process.env.PAYMENT_API_KEY,`,
      patchExplanation:
        "Move the secret to a protected environment variable and rotate the exposed value.",
      attackPath: [
        {
          id: "entry",
          label: "payment.ts",
          type: "entry",
          status: "discovered",
          file: "src/services/payment.ts",
          line: 7,
        },
        {
          id: "sink",
          label: "Embedded apiKey",
          type: "sink",
          status: "risky",
          file: "src/services/payment.ts",
          line: 7,
        },
        {
          id: "impact",
          label: "Credential reuse risk",
          type: "impact",
          status: "risky",
        },
      ],
    },
    {
      id: "unsafe-html",
      title: "Unsafe HTML rendering",
      category: "Injection/XSS",
      severity: "LOW",
      status: "OPEN",
      file: "src/components/Review.tsx",
      line: 22,
      locationLabel: "src/components/Review.tsx",
      confidence: 76,
      reachability: "Authenticated user content",
      scoreImpact: -5,
      whyItMatters:
        "User-controlled review content is inserted as raw HTML. If sanitization is incomplete, an attacker may inject content into another user's browser.",
      attackerStory:
        "User-controlled review content is inserted as raw HTML. If sanitization is incomplete, an attacker may inject content into another user's browser.",
      evidence: [
        "Content is passed to dangerouslySetInnerHTML.",
        "Sanitization is not visible in the provided context.",
        "Review data may be user-generated.",
      ],
      limitations: [
        "Sanitization in shared UI utilities may exist outside this file.",
        "The demo does not render attacker-controlled HTML.",
      ],
      codeBefore: `export function Review({ html }: { html: string }) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}`,
      highlightTerms: ["dangerouslySetInnerHTML"],
      patch: `- return <div dangerouslySetInnerHTML={{ __html: html }} />;
+ return <div>{html}</div>;`,
      patchExplanation: "Render text safely or sanitize using an approved library.",
      attackPath: [
        {
          id: "input",
          label: "User review HTML",
          type: "input",
          status: "suspicious",
          file: "src/components/Review.tsx",
          line: 22,
        },
        {
          id: "sink",
          label: "dangerouslySetInnerHTML",
          type: "sink",
          status: "risky",
          file: "src/components/Review.tsx",
          line: 22,
        },
        {
          id: "impact",
          label: "Stored XSS risk",
          type: "impact",
          status: "risky",
        },
      ],
    },
  ];
}

export const DEMO_REPO = "vulnerable-shop";
export const DEMO_SCORE_BEFORE = 64;
export const DEMO_SCORE_AFTER = 86;
export const DEMO_GRADE_BEFORE = "C";
export const DEMO_GRADE_AFTER = "B";
export const PRIMARY_FINDING_ID = "missing-object-auth";

export const DEMO_ATTACK_SURFACE = {
  publicRoutes: 8,
  authenticatedRoutes: 11,
  databaseSinks: 7,
  sensitiveOperations: 5,
} as const;

export const DEMO_SCORE_BREAKDOWN = {
  authorization: 48,
  inputHandling: 61,
  configuration: 72,
  secrets: 90,
  authentication: 84,
} as const;

export type DemoFinding = {
  id: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  location: string;
  route?: string;
  story: string;
  evidence: string[];
  suggestedFix: string;
  patchBefore: string;
  patchAfter: string;
};

function toLegacyFinding(finding: SecurityFinding): DemoFinding {
  const patchLines = (finding.patch ?? "").split("\n");
  const before = patchLines
    .filter((line) => line.startsWith("-"))
    .map((line) => line.slice(2))
    .join("\n");
  const after = patchLines
    .filter((line) => line.startsWith("+"))
    .map((line) => line.slice(2))
    .join("\n");

  const severity: DemoFinding["severity"] =
    finding.severity === "HIGH" || finding.severity === "CRITICAL"
      ? "HIGH"
      : finding.severity === "MEDIUM"
        ? "MEDIUM"
        : "LOW";

  return {
    id: finding.id,
    severity,
    title: finding.title,
    location: `${finding.file}:${finding.line}`,
    route: finding.locationLabel,
    story: finding.attackerStory,
    evidence: finding.evidence,
    suggestedFix: finding.patchExplanation ?? "",
    patchBefore: before || finding.codeBefore,
    patchAfter: after,
  };
}

export const DEMO_FINDINGS: DemoFinding[] = createDemoFindings().map(toLegacyFinding);

export function countBySeverity(findings: DemoFinding[]) {
  return findings.reduce(
    (counts, finding) => {
      if (finding.severity === "HIGH") return { ...counts, high: counts.high + 1 };
      if (finding.severity === "MEDIUM") return { ...counts, medium: counts.medium + 1 };
      return { ...counts, low: counts.low + 1 };
    },
    { high: 0, medium: 0, low: 0 },
  );
}

export function getPrimaryFinding() {
  const finding = DEMO_FINDINGS.find((item) => item.id === PRIMARY_FINDING_ID);
  if (!finding) {
    throw new Error("Primary demo finding is missing.");
  }
  return finding;
}
