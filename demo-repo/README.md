# Harbor Market

Small TypeScript shop used as a **scan target** for C0RTEX.

This repository is intentionally insecure. It exists so an authorized analyzer can map routes, trace source-to-sink paths, and propose reviewable fixes. Do not deploy it. Do not point it at real customers or real credentials.

## Stack

Express, a fake in-memory database, a payment client stub, and a React review widget.

## What C0RTEX is expected to flag

| Area | Where to look |
| --- | --- |
| Missing object authorization | `src/routes/orders.ts` |
| SQL string interpolation | `src/routes/search.ts` |
| Command string built from query input | `src/routes/admin.ts` |
| Unvalidated file path | `src/routes/files.ts` |
| Server-side fetch of a user URL | `src/routes/webhooks.ts` |
| Open redirect | `src/routes/users.ts` |
| Wildcard CORS + credentials | `src/config/cors.ts` |
| Hardcoded payment key (fake) | `src/services/payment.ts` |
| Hardcoded JWT placeholder | `src/middleware/auth.ts` |
| Raw HTML reviews | `src/components/Review.tsx` |
| Debug dump of process env | `src/routes/admin.ts` |

## Local run

```bash
npm install
npm run dev
```

Default listen address is `http://localhost:4000`.
