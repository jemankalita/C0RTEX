# C0RTEX

Authorized, developer-first **AI security analysis**. C0RTEX reads an authorized codebase the way an attacker would: it maps the attack surface, traces source-to-sink paths, explains impact, scores risk, and suggests a **reviewable** fix. It does not exploit live systems, push to GitHub, or generate exploit payloads.

This repository is both the product landing site and a working analyzer demo. The built-in scan target is **Harbor Market** (`demo-repo`), an intentionally vulnerable TypeScript shop.

**Product flow:** SCAN → MAP → TRACE → REASON → SCORE → FIX → RECHECK

C0RTEX is for **authorized defensive analysis only**. Scores and findings are a prioritization signal, not a security guarantee.

---

## What it does

1. You confirm authorization and choose a source (built-in demo or a public GitHub URL).
2. The server loads files into an in-memory **working copy**.
3. A **deterministic rule scanner** flags candidate issues (injection, access control, secrets, XSS, misconfiguration).
4. **Threat lenses** scope which families of issues to review.
5. Specialized **agents** (deterministic, or Gemini when configured) add recon, explanation, and extra candidates.
6. Findings are enriched with attack paths, evidence, confidence, and score impact.
7. You can generate a **unified-diff hint**, apply it only to the scan working copy, export the patched file, and **recheck** that the selected rule no longer matches.

C0RTEX never writes to your real repository and never pushes to GitHub.

---

## Routes (UI)

| Path | Purpose |
| --- | --- |
| `/` | Marketing landing page (workflow, attack-path story, safety score, accuracy bench teaser) |
| `/tool` | Live analyzer. Use `?demo=true` to pre-check authorization |
| `/benchmark` | Held-out detection bench on labeled snippets (precision / recall / F1 by CWE family) |

---

## Architecture

C0RTEX is a **Next.js App Router** app. The browser never holds LLM keys. Scan state lives in a **process-local in-memory store** (not a database). Progress is streamed over **Server-Sent Events (SSE)**.

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser                                                         │
│  LandingPage  │  ToolPage (useDemoScan)  │  BenchmarkPage        │
│       │                 │                        │              │
│       │          scanClient.ts                   │              │
│       │   createScan / EventSource / patch /     │              │
│       │   apply / export / recheck               │              │
└───────┼─────────────────┼────────────────────────┼──────────────┘
        │                 │                        │
        ▼                 ▼                        ▼
┌─────────────────────────────────────────────────────────────────┐
│  Next.js route handlers  (src/app/api)                           │
│  POST /api/scans                                                 │
│  GET  /api/scans/:id  ·  /events (SSE)  ·  /report               │
│  POST /findings/:id/{analyze,patch,apply,recheck}                │
│  GET  /findings/:id/export  ·  GET /patched-files                │
│  GET  /api/settings  (public: live vs demo, no secrets)          │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Orchestrator  (src/server/orchestrator.ts)                      │
│  load repo → scan rules → select lenses → extract context        │
│  → run agents (recon + lenses + review) → enrich → score report  │
└───┬────────────┬────────────┬────────────┬───────────┬──────────┘
    │            │            │            │           │
    ▼            ▼            ▼            ▼           ▼
 loadDemo /   scanRepo    lenses.ts    runAgents    Gemini
 loadGitHub   (rules)                  + extract    (optional)
    │            │                         │
    ▼            ▼                         ▼
 in-memory    RawFinding              LLMProvider
 ScanRecord   + FindingContext        or deterministic
```

### Layers

| Layer | Location | Role |
| --- | --- | --- |
| App Router pages | `src/app/` | `/`, `/tool`, `/benchmark`, API routes |
| Tool UI | `src/components/tool/` | Repository picker, scan progress, findings, attack path, patch viewer |
| Landing UI | `src/components/` + `landing/` | Hero, workflow, threat report preview, motion (GSAP, Framer Motion, Lenis, Spline) |
| Client API | `src/lib/scanClient.ts` | Typed fetch + `EventSource` for scan events |
| Domain types | `src/types/security.ts` | Findings, attack paths, score, scan modes |
| Server types | `src/server/types.ts` | Loaded repo, raw findings, agent results, progress events |
| Orchestrator | `src/server/orchestrator.ts` | End-to-end scan pipeline and stage events |
| Store | `src/server/store.ts` | In-memory `ScanRecord` map on `globalThis` (survives HMR) |
| Scanner | `src/server/scanner/scanRepository.ts` | Line-oriented regex / pattern rules |
| Lenses | `src/server/lenses.ts` | Auto or guided threat-family selection |
| Agents | `src/server/agents/runAgents.ts` | Recon + five lenses + review synthesizer |
| LLM | `src/server/llm/provider.ts` | `LLMProvider.generateStructured<T>` (Gemini JSON) |
| Context | `src/server/context/extractContext.ts` | Nearby code, routes, middleware, tests; secrets masked |
| Enrichment | `src/server/fallback/enrichFindings.ts` | Maps raw hits to `SecurityFinding` (demo catalog or generic) |
| Patch | `src/lib/suggestPatch.ts`, `applyUnifiedHint.ts` | Rule-aware hint + apply to working copy |
| Score | `src/lib/score.ts` | 0–100 prioritization score and letter grade |
| Bench | `src/lib/evaluateKaggleBench.ts` | Offline rule evaluation on labeled snippets |
| Demo target | `demo-repo/` | Harbor Market (Express + fake DB + React widget) |

---

## Scan pipeline (backend stages)

The orchestrator emits `ScanProgressEvent`s. The tool UI maps some backend stages onto a shorter product status via `toUiStatus`.

| Stage | What happens |
| --- | --- |
| `queued` | Scan record created; analysis not started |
| `preparing` | Load `demo-repo` from disk or fetch a GitHub tree (max 80 files, 120 KB each) |
| `mapping` | Count files; run `scanRepository` |
| `detecting` | Deterministic rules produce `RawFinding[]` |
| `tracing` | Select **threat lenses** (`auto` from repo signals, or `guided` from the client) |
| `reasoning` | Parallel agents: `recon` + selected lenses (capped by `MAX_AGENT_CONCURRENCY`) |
| `synthesizing` | Merge agent-discovered findings (must match a real file path); run `review` |
| `scoring` | Build `ScanReport` (routes, sinks, limitations, failed agents) |
| `report_ready` | Client fetches `/report` |
| `patching` | Suggested unified hint generated or applied to the working copy |
| `rechecking` | Re-run the selected **rule** on the patched file |
| `resolved` | Finding marked `RESOLVED`; score can recover |
| `error` | Load or analysis failed; message returned without leaking secrets |

**Analysis mode**

- **Demo:** no `GEMINI_API_KEY` (or `ENABLE_LIVE_ANALYSIS=false`). Agents return deterministic summaries. Findings are enriched from the Harbor Market catalog when IDs match.
- **Live:** Gemini `gemini-3.6-flash` with `responseMimeType: application/json`. Prompts treat repo text as **untrusted data** (no instruction-following from files, no exploit payloads, no invented paths). Live findings are kept only if `file` exists in the loaded repo.

---

## Threat lenses

A **threat lens** is a scoped review family. Scan mode is `auto` or `guided`.

| Lens | Typical rule IDs | When auto-selected |
| --- | --- | --- |
| `access-control` | `missing-object-auth`, `mass-assignment`, `auth-fallback` | Routes / HTTP handlers, or those rules fired |
| `injection` | `sql-injection`, `command-injection`, `path-traversal`, `ssrf` | `db.query`, `exec`, `readFile`, `fetch`, or those rules |
| `browser-safety` | `unsafe-html`, `open-redirect` | `dangerouslySetInnerHTML`, `innerHTML`, `document.write` |
| `secrets` | `hardcoded-secret`, `insecure-jwt` | `API_KEY`, `SECRET`, `sk_`, `AIza`, etc. |
| `configuration` | `wildcard-cors`, `debug-env`, `insecure-cookie` | Wildcard CORS or those rules |

If auto-selection finds nothing, all five lenses run.

---

## Deterministic detection rules

`scanRepository` walks every line of every loaded file. Rules are **pattern matchers**, not a full AST or taint engine. They annotate **source** (user input), **sink** (dangerous API), and often a **route**.

| `ruleId` | Category | Idea |
| --- | --- | --- |
| `missing-object-auth` | Broken Access Control | Lookup by `req.params.id` without binding to the current user (IDOR) |
| `mass-assignment` | Broken Access Control | `User.update(..., req.body)` without field allow-list |
| `auth-fallback` | Broken Access Control | Failed token still assigns a default user |
| `sql-injection` | Injection | SQL / query strings interpolated with `req.*` |
| `command-injection` | Injection | `exec` / `spawn` built from request data |
| `path-traversal` | Injection | `readFile` path from request data |
| `ssrf` | Injection | `fetch(req.query/body/params…)` |
| `open-redirect` | Security Misconfiguration | `redirect(req.query…)` |
| `wildcard-cors` | Security Misconfiguration | `origin: "*"` in CORS config |
| `debug-env` | Security Misconfiguration | `res.json(...process.env)` |
| `insecure-cookie` | Security Misconfiguration | Session cookie with `httpOnly: false` |
| `hardcoded-secret` | Cryptographic / Secret Management | Embedded `sk_…` or long secret literals |
| `insecure-jwt` | Cryptographic / Secret Management | Hardcoded JWT signing secret |
| `unsafe-html` | Injection / XSS | `dangerouslySetInnerHTML` or `.innerHTML =` |

**Recheck** calls `scanFileForRule` on the working-copy file. If the rule no longer matches after apply, the finding becomes `RESOLVED`. Recheck verifies **that path**, not the whole application.

---

## Agents

| Agent | Role |
| --- | --- |
| `recon` | File / route / sink counts for the application map |
| `access-control` | Authorization and object-level access |
| `injection` | SQLi, command, path, SSRF |
| `browser-safety` | XSS and open redirect |
| `secrets` | Keys and JWT material |
| `configuration` | CORS, cookies, debug dumps |
| `review` | Merge pass after lenses |

Live agents send masked excerpts (first 16 files, 2400 chars each) plus known finding context. Failures are recorded in `failedAgents` and do not abort the whole scan.

Concurrency: `MAX_AGENT_CONCURRENCY` (default 5) limits how many lens agents run with recon.

---

## Findings, attack paths, and scoring

A **`SecurityFinding`** is the UI-facing object:

- **Severity:** `CRITICAL` · `HIGH` · `MEDIUM` · `LOW` · `NEEDS_REVIEW`
- **Status:** `OPEN` → `UNDER_REVIEW` (patch drafted) → `PATCH_APPLIED` (working copy only) → `RESOLVED` (recheck passed)
- **Reachability:** whether the risky path looks callable from an entry (demo catalog uses concrete stories)
- **Confidence:** 0–100 (from rule weight or live default)
- **Score impact:** how much the safety score can recover if this finding is resolved
- **Attack path:** ordered nodes — `entry` → `input` → `handler` → `sink` / `missing-control` → `impact`
- **Evidence / limitations:** snippets and honesty about demo vs live and partial agents
- **Patch:** a small unified-diff **hint** (`-` / `+` lines), not a git commit

**Safety score** (`src/lib/score.ts`)

- Starts at **64** (grade **C**).
- Resolving findings adds back `|scoreImpact|`, clamped 0–100.
- Resolving the primary object-authorization finding floors the score at **86** (grade **B**).
- Grades: A ≥ 90, B ≥ 80, C ≥ 64, D ≥ 50, else F.
- Category bars (authorization, input handling, configuration, secrets, authentication) are demo heuristics, not a formal CVSS vector.

---

## Patch, apply, export

1. **Suggest** (`POST .../patch`): `suggestPatch` prefers an existing hint if `applyUnifiedHint` would succeed; otherwise it rewrites the target line by `ruleId` (parameterize SQL, `path.basename`, `pick(req.body)`, env vars, etc.).
2. **Apply** (`POST .../apply` with `{ confirmed: true }`): writes only into `ScanRecord.files`. Requires explicit confirmation. Does **not** touch `demo-repo` on disk or GitHub.
3. **Export** (`GET .../export`): returns original content, hint, explanation, and patched content so you can save a file locally.
4. **`applyUnifiedHint`:** parses `+`/`-` hunk lines and replaces the first matching line (or substring) while preserving indentation. This is a **hint applier**, not `git apply` / full unified-diff.

---

## HTTP API

Typical JSON errors include `{ error, retry?, demo? }` and avoid leaking keys.

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/scans` | Body: `{ authorized, source: "demo" \| "github", githubUrl?, mode?: "auto" \| "guided", lenses?: ThreatLens[] }`. Returns `{ scanId, status }`. |
| `GET` | `/api/scans/:scanId` | Status, progress, analysis mode, error |
| `GET` | `/api/scans/:scanId/events` | SSE stream of `ScanProgressEvent` |
| `GET` | `/api/scans/:scanId/report` | Full `ScanReport` + current findings |
| `GET` | `/api/scans/:scanId/patched-files` | Files touched in the working copy |
| `POST` | `/api/scans/:scanId/findings/:findingId/analyze` | Echo finding + analysis mode |
| `POST` | `/api/scans/:scanId/findings/:findingId/patch` | Draft hint; status `UNDER_REVIEW` |
| `POST` | `/api/scans/:scanId/findings/:findingId/apply` | Apply to working copy (`confirmed: true`) |
| `GET` | `/api/scans/:scanId/findings/:findingId/export` | Downloadable original / patched pair |
| `POST` | `/api/scans/:scanId/findings/:findingId/recheck` | Re-run the rule; may mark `RESOLVED` |
| `GET` | `/api/settings` | `{ liveEnabled, analysisMode, provider, configured }` — no API key |

Authorization: `authorized: true` is required to create a scan. The UI checkbox / `?demo=true` is the gate; this is **not** multi-tenant auth.

---

## Repository ingestion

| Source | Behavior |
| --- | --- |
| **Demo** | `loadExistingDemoRepository` reads `demo-repo/` (JS/TS and related files) |
| **GitHub** | Public REST: repo metadata → recursive git tree → raw file download. Skip `node_modules`, `.git`, `dist`, `.next`, etc. Allowed extensions include `.js/.ts/.tsx`, `.py`, `.go`, `.rb`, `.php`, `.java`, `.cs`, `.vue`, `.html`, `.json`. Cap: **80 files**, **120 KB** each. |

ZIP upload may appear in the UI as a source kind; this build still analyzes the demo or a GitHub URL. Language support in the product copy is **JavaScript / TypeScript first**; GitHub load accepts more extensions for mixed trees.

Secrets in excerpts are masked (`src/server/mask.ts`) before they go to the model.

---

## Demo target: Harbor Market

`demo-repo/` is a small Express shop with a fake in-memory database, a payment stub, and a React review widget. **Do not deploy it.**

| Issue | Location |
| --- | --- |
| Missing object authorization | `src/routes/orders.ts` |
| SQL string interpolation | `src/routes/search.ts` |
| Command built from query input | `src/routes/admin.ts` |
| Unvalidated file path | `src/routes/files.ts` |
| User-controlled outbound fetch | `src/routes/webhooks.ts` |
| Open redirect | `src/routes/users.ts` |
| Wildcard CORS + credentials | `src/config/cors.ts` |
| Hardcoded payment key (fake) | `src/services/payment.ts` |
| Hardcoded JWT placeholder | `src/middleware/auth.ts` |
| Raw HTML reviews | `src/components/Review.tsx` |
| Debug dump of `process.env` | `src/routes/admin.ts` |

Optional local run of the shop: `cd demo-repo && npm install && npm run dev` → `http://localhost:4000`.

---

## Benchmark

`/benchmark` runs `evaluateKaggleBench` against labeled snippets in `src/data/kaggleBenchSamples.ts` (Kaggle-style JS/TS/Python web CWEs). C0RTEX is **not trained** on that set. Outcomes: true/false positive/negative, plus **precision**, **recall**, and **F1** per family (`injection`, `browser-safety`, `secrets`, `access-control`, `configuration`). Attribution: [source-code-vulnerability](https://www.kaggle.com/datasets/maratsaratov/source-code-vulnerability).

---

## Glossary

| Term | Meaning in C0RTEX |
| --- | --- |
| **Attack surface** | Entry points: public/authenticated routes, uploads, webhooks |
| **Source** | Untrusted input (`req.query`, `req.body`, `req.params`) |
| **Sink** | Dangerous operation (`db.query`, `exec`, `readFile`, `fetch`, `innerHTML`) |
| **Source-to-sink / attack path** | Trace from entry through handler to impact |
| **Reachability** | Whether that path looks actually callable |
| **IDOR / missing object auth** | Accessing another user’s object by ID without an ownership check |
| **SSRF** | Server fetches a URL the user controls |
| **Mass assignment** | Persisting the entire request body, including privileged fields |
| **CWE** | Common Weakness Enumeration IDs used on the bench (e.g. CWE-89 SQLi) |
| **Threat lens** | Scoped agent/rule family |
| **Deterministic analysis** | Rule engine, no model required |
| **Live analysis** | Gemini structured JSON on excerpts |
| **Working copy** | In-memory files for one `scanId` |
| **Unified hint** | Minimal `+`/`-` patch text, not a full git diff |
| **SSE** | Server-Sent Events for scan progress |
| **Prompt injection (defense)** | Repo text is treated as data; agents must not follow instructions found in files |
| **Safety score** | Prioritization 0–100, not a certification |
| **CVSS** | Industry severity formula; C0RTEX does **not** compute CVSS |

---

## Local setup

Requires **Node.js 20+**.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Then open:

- [http://localhost:3000](http://localhost:3000)
- [http://localhost:3000/tool?demo=true](http://localhost:3000/tool?demo=true)
- [http://localhost:3000/benchmark](http://localhost:3000/benchmark)

Production-style:

```bash
npm run build
npm start
```

### Environment (`.env.local`)

```bash
LLM_PROVIDER=gemini
GEMINI_API_KEY=
MAX_AGENT_CONCURRENCY=5
ENABLE_LIVE_ANALYSIS=true
```

| Variable | Purpose |
| --- | --- |
| `LLM_PROVIDER` | Must be `gemini` for live mode |
| `GEMINI_API_KEY` | Server-only. **Never** prefix with `NEXT_PUBLIC_` |
| `MAX_AGENT_CONCURRENCY` | Parallel lens agents (default 5) |
| `ENABLE_LIVE_ANALYSIS` | Set `false` to force demo agents even if a key exists |

Without a key, scans still run in **demo analysis mode**.

---

## Using the analyzer

1. Confirm you are authorized to analyze the target.
2. Start with Harbor Market, or paste a public GitHub URL you are allowed to scan.
3. Optionally use **guided** mode and pick lenses.
4. Watch stages, then review the application map, findings, attack path, and evidence.
5. Generate a suggested patch, confirm apply to the **temporary working copy**, export if you want the file locally, then recheck.

---

## Stack

| Area | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack in `dev`) |
| UI | React 19, TypeScript |
| Style | Tailwind CSS 4 |
| Motion | GSAP, Framer Motion, Lenis smooth scroll, Spline robot |
| Tests | Vitest, Testing Library, jsdom |
| LLM | Google Gemini generateContent, JSON mode |
| GitHub | Unauthenticated public REST + raw.githubusercontent.com |
| State | In-memory `Map` on `globalThis` (single process; lost on restart) |

---

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Next.js + Turbopack |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm test` | Vitest once |
| `npm run test:watch` | Vitest watch |

Tests cover scoring, finding state, GitHub URL parsing, rule scanning, lenses, patch apply, suggest-patch, public settings, scan stages, and the labeled bench.

---

## Repository layout (high level)

```
C0RTEX/
├── demo-repo/                 Harbor Market scan target
├── src/app/                   Pages + API routes
├── src/components/            Landing, tool, benchmark, motion
├── src/hooks/                 useDemoScan, finding state
├── src/lib/                   Client, score, patch, bench, errors
├── src/server/                Orchestrator, scanner, agents, LLM, store
├── src/types/                 Shared domain types
├── src/data/                  Demo findings, workflow copy, bench samples
└── .env.example
```

---

## Safety and limits

- Use only on systems you **own** or have **written permission** to analyze.
- Do not use this project to attack, exploit, or scan unauthorized systems.
- The scanner is pattern-based. It will miss issues and can false-positive.
- Live Gemini sees **excerpts**, not a guaranteed full program dependence graph.
- Apply/recheck only mutates the **scan working copy**. You must review and commit fixes in your own repo.
- In-memory scans do not persist across server restarts or multiple server instances.
- Findings, patches, and scores in the demo are illustrative.

Do not commit `.env.local` or real API keys.
