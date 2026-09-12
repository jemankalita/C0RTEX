import { db } from "../services/database";

type Router = {
  get: (path: string, handler: (...args: never[]) => unknown) => void;
};

export function registerSearchRoutes(router: Router) {
  router.get("/search", async (req, res) => {
    const rows = await db.query(`SELECT * FROM products WHERE name LIKE '%${req.query.q}%'`);
    res.json(rows);
  });
}
