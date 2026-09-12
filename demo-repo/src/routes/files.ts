import { readFile } from "node:fs/promises";
import { requireAuth } from "../middleware/auth";

type Router = {
  get: (path: string, ...handlers: Array<(...args: never[]) => unknown>) => void;
};

export function registerFileRoutes(router: Router) {
  router.get("/files/invoice", requireAuth, async (req, res) => {
    const contents = await readFile(`./uploads/${req.query.name}`);
    res.type("application/octet-stream").send(contents);
  });
}
