import express from "express";
import cors from "cors";
import { corsOptions } from "./config/cors";
import { attachSessionCookie } from "./config/session";
import { registerAdminRoutes } from "./routes/admin";
import { registerCheckoutRoutes } from "./routes/checkout";
import { registerFileRoutes } from "./routes/files";
import { registerOrderRoutes } from "./routes/orders";
import { registerSearchRoutes } from "./routes/search";
import { registerUserRoutes } from "./routes/users";
import { registerWebhookRoutes } from "./routes/webhooks";

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(attachSessionCookie);

const api = {
  get: (path: string, ...handlers: Array<(...args: never[]) => unknown>) => {
    app.get(`/api${path}`, ...(handlers as express.RequestHandler[]));
  },
  post: (path: string, ...handlers: Array<(...args: never[]) => unknown>) => {
    app.post(`/api${path}`, ...(handlers as express.RequestHandler[]));
  },
};

registerSearchRoutes(api);
registerOrderRoutes(api);
registerUserRoutes(api);
registerCheckoutRoutes(api);
registerAdminRoutes(api);
registerFileRoutes(api);
registerWebhookRoutes(api);

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "harbor-market" });
});

const port = Number(process.env.PORT ?? 4000);
app.listen(port);

export { app };
