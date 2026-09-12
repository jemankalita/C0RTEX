export function registerUserRoutes(router: { get: (path: string, handler: (...args: never[]) => unknown) => void }) {
  router.get("/users/me", (req, res) => {
    res.json({ id: req.user?.id ?? "anonymous" });
  });
}
