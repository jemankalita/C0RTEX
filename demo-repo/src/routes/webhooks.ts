type Router = {
  get: (path: string, handler: (...args: never[]) => unknown) => void;
};

export function registerWebhookRoutes(router: Router) {
  router.get("/webhooks/preview", async (req, res) => {
    const response = await fetch(req.query.url);
    const body = await response.text();
    res.type("text/plain").send(body);
  });
}
