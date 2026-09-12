import { exec } from "node:child_process";
import { promisify } from "node:util";
import { requireAuth } from "../middleware/auth";

const run = promisify(exec);

type Router = {
  get: (path: string, ...handlers: Array<(...args: never[]) => unknown>) => void;
};

export function registerAdminRoutes(router: Router) {
  router.get("/admin/export", requireAuth, async (req, res) => {
    const { stdout } = await run(`zip -r /tmp/export.zip ${req.query.path}`);
    res.type("text/plain").send(stdout);
  });

  router.get("/admin/debug", async (_req, res) => {
    res.json({ env: process.env, pid: process.pid });
  });
}
