import { requireAuth } from "../middleware/auth";
import { User } from "../services/database";

type Router = {
  get: (path: string, ...handlers: Array<(...args: never[]) => unknown>) => void;
  post: (path: string, ...handlers: Array<(...args: never[]) => unknown>) => void;
};

export function registerUserRoutes(router: Router) {
  router.get("/users/me", (req, res) => {
    res.json({ id: req.user?.id ?? "anonymous" });
  });

  router.get("/users/continue", (req, res) => {
    res.redirect(req.query.next);
  });

  router.post("/users/profile", requireAuth, async (req, res) => {
    const updated = await User.update(req.user.id, req.body);
    res.json(updated);
  });
}
