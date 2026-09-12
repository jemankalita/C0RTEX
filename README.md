# C0RTEX

Authorized, developer-first AI security analysis. C0RTEX reads a codebase like an attacker, maps the attack surface, traces risky paths, explains impact, and suggests a reviewable fix.

**Product flow:** SCAN → MAP → TRACE → REASON → SCORE → FIX → RECHECK

This repository is the landing page plus a live demo of the analyzer. The demo runs against a built-in TypeScript shop (`vulnerable-shop`). It does not exploit live systems.

## Routes

| Path | What you get |
| --- | --- |
| `/` | Product landing page |
| `/tool?demo=true` | Analyzer demo (authorization pre-checked) |

## Local setup

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Then open:

- [http://localhost:3000](http://localhost:3000)
- [http://localhost:3000/tool?demo=true](http://localhost:3000/tool?demo=true)

Production-style run:

```bash
npm run build
npm start
```

## Using the analyzer

1. Confirm you are authorized to analyze the target.
2. Start with the included demo repository, or note that ZIP / GitHub URL ingestion still uses the demo in this build.
3. Watch the scan stages, then review the application map, findings, attack path, and evidence.
4. Generate a suggested patch, confirm it, apply it to the temporary demo copy, and recheck.

C0RTEX is for **authorized defensive analysis only**. Do not scan systems you do not own or have permission to test. Scores and findings are a prioritization signal, not a security guarantee.

## Stack

- Next.js (App Router) and React
- TypeScript
- Tailwind CSS
- Motion / GSAP for landing motion

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Local Next.js server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm test` | Vitest |

## Safety

Do not use this project to attack, exploit, or scan unauthorized systems. The demo findings, patches, and scores are illustrative and stay inside the local demo repository.
