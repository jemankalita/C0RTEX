import { requireAuth } from "../middleware/auth";
import { Order } from "../services/database";

type Router = {
  get: (path: string, ...handlers: Array<(...args: never[]) => unknown>) => void;
};

export function registerOrderRoutes(router: Router) {
  router.get("/orders/:id", requireAuth, async (req, res) => {
    const order = await Order.findById(req.params.id);
    res.json(order);
  });
}
