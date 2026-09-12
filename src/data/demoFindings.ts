import type { SecurityFinding } from "@/types/security";

export function createDemoFindings(): SecurityFinding[] {
  return [
    {
      id: "missing-object-auth",
      title: "Missing object authorization",
      category: "Broken Access Control",
      severity: "CRITICAL",
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
      id: "command-injection",
      title: "Possible command injection",
      category: "Injection",
      severity: "HIGH",
      status: "OPEN",
      file: "src/routes/admin.ts",
      line: 13,
      locationLabel: "/api/admin/export",
      confidence: 87,
      reachability: "Authenticated route",
      scoreImpact: -16,
      whyItMatters:
        "An export route builds a shell command from a query parameter. User-controlled text can change which files the process archives.",
      attackerStory:
        "A signed-in user can change the path query parameter. Because it is concatenated into a zip command, the process may archive unintended files on the host.",
      evidence: [
        "Input originates from req.query.path.",
        "The value is interpolated into a shell command string.",
        "child_process.exec runs the resulting command.",
      ],
      limitations: [
        "The demo does not execute the command on a live host.",
        "OS-level sandboxing was not inspected.",
      ],
      codeBefore: `const { stdout } = await run(\`zip -r /tmp/export.zip \${req.query.path}\`);`,
      highlightTerms: ["req.query.path"],
      patch: `- const { stdout } = await run(\`zip -r /tmp/export.zip \${req.query.path}\`);
+ const allowed = new Set(["invoices", "reports"]);
+ if (!allowed.has(String(req.query.path))) throw new Error("Invalid export");
+ const { stdout } = await run("zip -r /tmp/export.zip ./exports/" + String(req.query.path));`,
      patchExplanation: "Allow only a fixed export folder name and keep user input out of the command template.",
      attackPath: [
        {
          id: "entry",
          label: "GET /api/admin/export",
          type: "entry",
          status: "discovered",
          file: "src/routes/admin.ts",
          line: 13,
        },
        {
          id: "input",
          label: "req.query.path",
          type: "input",
          status: "suspicious",
          file: "src/routes/admin.ts",
          line: 13,
        },
        {
          id: "sink",
          label: "child_process.exec",
          type: "sink",
          status: "risky",
          file: "src/routes/admin.ts",
          line: 13,
        },
        {
          id: "impact",
          label: "Unintended host files",
          type: "impact",
          status: "risky",
        },
      ],
    },
    {
      id: "path-traversal",
      title: "Unvalidated file path",
      category: "Injection",
      severity: "HIGH",
      status: "OPEN",
      file: "src/routes/files.ts",
      line: 10,
      locationLabel: "/api/files/invoice",
      confidence: 84,
      reachability: "Authenticated route",
      scoreImpact: -15,
      whyItMatters:
        "Invoice download concatenates a user-supplied file name onto a disk path. Directory markers in the name can reach files outside the upload folder.",
      attackerStory:
        "An authenticated customer can change the name query parameter. The handler reads whatever path is formed, including files outside ./uploads.",
      evidence: [
        "Input originates from req.query.name.",
        "The value is concatenated into a filesystem path.",
        "No allow-list or path normalization is visible.",
      ],
      limitations: ["The demo does not read files from a live disk during analysis."],
      codeBefore: `const contents = await readFile(\`./uploads/\${req.query.name}\`);`,
      highlightTerms: ["req.query.name"],
      patch: `- const contents = await readFile(\`./uploads/\${req.query.name}\`);
+ const safeName = path.basename(String(req.query.name));
+ const contents = await readFile(path.join("./uploads", safeName));`,
      patchExplanation: "Resolve the file name with basename and join it under a fixed directory.",
      attackPath: [
        {
          id: "entry",
          label: "GET /api/files/invoice",
          type: "entry",
          status: "discovered",
          file: "src/routes/files.ts",
          line: 10,
        },
        {
          id: "sink",
          label: "fs.readFile",
          type: "sink",
          status: "risky",
          file: "src/routes/files.ts",
          line: 10,
        },
        {
          id: "impact",
          label: "Files outside uploads",
          type: "impact",
          status: "risky",
        },
      ],
    },
    {
      id: "ssrf",
      title: "User-controlled outbound fetch",
      category: "Injection",
      severity: "HIGH",
      status: "OPEN",
      file: "src/routes/webhooks.ts",
      line: 7,
      locationLabel: "/api/webhooks/preview",
      confidence: 83,
      reachability: "Public route",
      scoreImpact: -14,
      whyItMatters:
        "A public preview route fetches any URL supplied by the client and returns the body. The server may reach internal services the browser cannot.",
      attackerStory:
        "Anyone who can call the preview route can supply a URL. The server fetches that address and reflects the response, including internal hosts.",
      evidence: [
        "Input originates from req.query.url.",
        "fetch is called with that value directly.",
        "The response body is returned to the caller.",
      ],
      limitations: ["The demo does not perform outbound network requests during analysis."],
      codeBefore: `const response = await fetch(req.query.url);`,
      highlightTerms: ["req.query.url"],
      patch: `- const response = await fetch(req.query.url);
+ const allowed = new URL("https://hooks.example.com");
+ const requested = new URL(String(req.query.url));
+ if (requested.origin !== allowed.origin) throw new Error("Blocked host");
+ const response = await fetch(requested);`,
      patchExplanation: "Allow only a known webhook origin before the server fetches a URL.",
      attackPath: [
        {
          id: "entry",
          label: "GET /api/webhooks/preview",
          type: "entry",
          status: "discovered",
          file: "src/routes/webhooks.ts",
          line: 7,
        },
        {
          id: "sink",
          label: "fetch",
          type: "sink",
          status: "risky",
          file: "src/routes/webhooks.ts",
          line: 7,
        },
        {
          id: "impact",
          label: "Internal service access",
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
      id: "insecure-jwt",
      title: "Hardcoded JWT signing secret",
      category: "Cryptographic/Secret Management",
      severity: "MEDIUM",
      status: "OPEN",
      file: "src/middleware/auth.ts",
      line: 17,
      locationLabel: "src/middleware/auth.ts",
      confidence: 86,
      reachability: "Authentication middleware",
      scoreImpact: -9,
      whyItMatters:
        "Session tokens are verified with a secret stored in source. Anyone with the repository can mint valid tokens.",
      attackerStory:
        "The JWT secret is a source constant. A reader of the repo can sign tokens that this middleware accepts.",
      evidence: [
        "jwt.verify uses DEMO_JWT_SECRET from the same file.",
        "The secret is not loaded from the environment.",
      ],
      limitations: ["The demo secret is a placeholder and is not a production credential."],
      codeBefore: `const payload = jwt.verify(token.replace("Bearer ", ""), DEMO_JWT_SECRET) as { id?: string };`,
      highlightTerms: ["DEMO_JWT_SECRET"],
      patch: `- const payload = jwt.verify(token.replace("Bearer ", ""), DEMO_JWT_SECRET) as { id?: string };
+ const payload = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET ?? "") as { id?: string };`,
      patchExplanation: "Load the signing secret from the environment and reject tokens when it is missing.",
      attackPath: [
        {
          id: "entry",
          label: "requireAuth",
          type: "entry",
          status: "discovered",
          file: "src/middleware/auth.ts",
          line: 17,
        },
        {
          id: "sink",
          label: "jwt.verify",
          type: "sink",
          status: "risky",
          file: "src/middleware/auth.ts",
          line: 17,
        },
        {
          id: "impact",
          label: "Forged sessions",
          type: "impact",
          status: "risky",
        },
      ],
    },
    {
      id: "open-redirect",
      title: "Open redirect",
      category: "Security Misconfiguration",
      severity: "MEDIUM",
      status: "OPEN",
      file: "src/routes/users.ts",
      line: 15,
      locationLabel: "/api/users/continue",
      confidence: 80,
      reachability: "Public route",
      scoreImpact: -8,
      whyItMatters:
        "The continue route redirects to whatever URL is supplied in the query string. That can send users to an unexpected host after login.",
      attackerStory:
        "A crafted continue link can send a customer to a third-party page while still appearing to start on Harbor Market.",
      evidence: [
        "res.redirect is called with req.query.next.",
        "No allow-list of destinations is visible.",
      ],
      limitations: ["Browser redirect behavior was not verified live."],
      codeBefore: `res.redirect(req.query.next);`,
      highlightTerms: ["req.query.next"],
      patch: `- res.redirect(req.query.next);
+ const next = new URL(String(req.query.next), "https://shop.example.com");
+ if (next.origin !== "https://shop.example.com") throw new Error("Invalid redirect");
+ res.redirect(next.pathname + next.search);`,
      patchExplanation: "Allow redirects only to the shop origin.",
      attackPath: [
        {
          id: "entry",
          label: "GET /api/users/continue",
          type: "entry",
          status: "discovered",
          file: "src/routes/users.ts",
          line: 15,
        },
        {
          id: "sink",
          label: "res.redirect",
          type: "sink",
          status: "risky",
          file: "src/routes/users.ts",
          line: 15,
        },
        {
          id: "impact",
          label: "Off-site redirect",
          type: "impact",
          status: "risky",
        },
      ],
    },
    {
      id: "mass-assignment",
      title: "Unfiltered profile update",
      category: "Broken Access Control",
      severity: "MEDIUM",
      status: "OPEN",
      file: "src/routes/users.ts",
      line: 19,
      locationLabel: "/api/users/profile",
      confidence: 78,
      reachability: "Authenticated route",
      scoreImpact: -8,
      whyItMatters:
        "The profile handler writes the entire request body onto the user record. Extra fields such as role can be persisted if the store accepts them.",
      attackerStory:
        "A logged-in customer can include unexpected fields in the profile body. The update path does not pick a safe field list.",
      evidence: [
        "User.update receives req.body without field selection.",
        "The user model includes a role property.",
      ],
      limitations: ["The in-memory store does not enforce a schema."],
      codeBefore: `const updated = await User.update(req.user.id, req.body);`,
      highlightTerms: ["req.body"],
      patch: `- const updated = await User.update(req.user.id, req.body);
+ const updated = await User.update(req.user.id, { displayName: req.body.displayName });`,
      patchExplanation: "Persist only an explicit allow-list of profile fields.",
      attackPath: [
        {
          id: "entry",
          label: "POST /api/users/profile",
          type: "entry",
          status: "discovered",
          file: "src/routes/users.ts",
          line: 19,
        },
        {
          id: "sink",
          label: "User.update",
          type: "sink",
          status: "risky",
          file: "src/routes/users.ts",
          line: 19,
        },
        {
          id: "impact",
          label: "Unexpected user fields",
          type: "impact",
          status: "risky",
        },
      ],
    },
    {
      id: "auth-fallback",
      title: "Failed token still becomes a user",
      category: "Broken Access Control",
      severity: "MEDIUM",
      status: "OPEN",
      file: "src/middleware/auth.ts",
      line: 20,
      locationLabel: "src/middleware/auth.ts",
      confidence: 82,
      reachability: "Authentication middleware",
      scoreImpact: -10,
      whyItMatters:
        "When token verification fails, the middleware still assigns a default user and continues. Protected routes then run as that user.",
      attackerStory:
        "Any request that sends a non-empty Authorization header can pass requireAuth even if the token is invalid.",
      evidence: [
        "The catch path assigns req.user instead of returning 401.",
        "next() still runs after a verify failure.",
      ],
      limitations: ["Gateway authentication in front of the app was not inspected."],
      codeBefore: `} catch {
    req.user = { id: "user-1" };
  }

  next();`,
      highlightTerms: ['req.user = { id: "user-1" }'],
      patch: `-     req.user = { id: "user-1" };
+     res.status(401).json({ error: "Unauthorized" });
+     return;`,
      patchExplanation: "Reject the request when verification fails instead of inventing a user.",
      attackPath: [
        {
          id: "entry",
          label: "requireAuth",
          type: "entry",
          status: "discovered",
          file: "src/middleware/auth.ts",
          line: 20,
        },
        {
          id: "missing",
          label: "No reject on verify failure",
          type: "missing-control",
          status: "risky",
          file: "src/middleware/auth.ts",
          line: 20,
        },
        {
          id: "impact",
          label: "Protected routes as user-1",
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
    {
      id: "debug-env",
      title: "Debug endpoint exposes environment",
      category: "Security Misconfiguration",
      severity: "LOW",
      status: "OPEN",
      file: "src/routes/admin.ts",
      line: 18,
      locationLabel: "/api/admin/debug",
      confidence: 79,
      reachability: "Public route",
      scoreImpact: -6,
      whyItMatters:
        "A debug route returns process.env to any caller. Environment values often include service configuration.",
      attackerStory:
        "Anyone who can reach /api/admin/debug receives the process environment without an auth check.",
      evidence: [
        "The handler is registered without requireAuth.",
        "The response includes process.env.",
      ],
      limitations: ["The demo process environment does not contain production secrets."],
      codeBefore: `router.get("/admin/debug", async (_req, res) => {
    res.json({ env: process.env, pid: process.pid });
  });`,
      highlightTerms: ["process.env"],
      patch: `- router.get("/admin/debug", async (_req, res) => {
-     res.json({ env: process.env, pid: process.pid });
-   });`,
      patchExplanation: "Remove the debug route from deployed builds.",
      attackPath: [
        {
          id: "entry",
          label: "GET /api/admin/debug",
          type: "entry",
          status: "discovered",
          file: "src/routes/admin.ts",
          line: 18,
        },
        {
          id: "impact",
          label: "Environment disclosure",
          type: "impact",
          status: "risky",
        },
      ],
    },
    {
      id: "insecure-cookie",
      title: "Session cookie missing security flags",
      category: "Security Misconfiguration",
      severity: "LOW",
      status: "OPEN",
      file: "src/config/session.ts",
      line: 5,
      locationLabel: "src/config/session.ts",
      confidence: 74,
      reachability: "Global middleware",
      scoreImpact: -4,
      whyItMatters:
        "The session cookie is set with httpOnly disabled and SameSite none. Script on the page can read it, and cross-site requests can include it.",
      attackerStory:
        "Any script running in the shop origin can read hm_session because httpOnly is false.",
      evidence: [
        "httpOnly is set to false.",
        "sameSite is set to none with secure false.",
      ],
      limitations: ["Browser cookie behavior was not verified live."],
      codeBefore: `res.cookie("hm_session", "demo-session-token", {
    httpOnly: false,
    secure: false,
    sameSite: "none",
  });`,
      highlightTerms: ["httpOnly: false"],
      patch: `-     httpOnly: false,
-     secure: false,
-     sameSite: "none",
+     httpOnly: true,
+     secure: true,
+     sameSite: "lax",`,
      patchExplanation: "Mark the session cookie HttpOnly, Secure, and SameSite=Lax.",
      attackPath: [
        {
          id: "entry",
          label: "attachSessionCookie",
          type: "entry",
          status: "discovered",
          file: "src/config/session.ts",
          line: 5,
        },
        {
          id: "missing",
          label: "httpOnly: false",
          type: "missing-control",
          status: "suspicious",
          file: "src/config/session.ts",
          line: 5,
        },
        {
          id: "impact",
          label: "Readable session cookie",
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
