import type { DemoRepository } from "@/types/security";

export const DEMO_REPOSITORY: DemoRepository = {
  name: "vulnerable-shop",
  description:
    "A deliberately vulnerable TypeScript web application used to demonstrate C0RTEX’s contextual security analysis.",
  language: "TypeScript",
  framework: "Express",
  files: 24,
  routes: 19,
  publicRoutes: 8,
  authenticatedRoutes: 11,
  adminRoutes: 4,
  databaseSinks: 7,
  externalApiCalls: 5,
  sensitiveOperations: 5,
  tests: 9,
  fileList: [
    "src/routes/orders.ts",
    "src/routes/search.ts",
    "src/routes/users.ts",
    "src/controllers/orderController.ts",
    "src/services/database.ts",
    "src/config/cors.ts",
    "src/components/Review.tsx",
    "src/services/payment.ts",
    "src/middleware/auth.ts",
    "tests/orders.test.ts",
  ],
};
