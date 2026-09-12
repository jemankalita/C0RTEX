import { requireAuth } from "../middleware/auth";
import { chargeOrder, getPaymentClient } from "../services/payment";

type Router = {
  post: (path: string, ...handlers: Array<(...args: never[]) => unknown>) => void;
};

export function registerCheckoutRoutes(router: Router) {
  router.post("/checkout", requireAuth, async (req, res) => {
    getPaymentClient();
    const receipt = await chargeOrder(req.body.orderId, Number(req.body.amount));
    res.json(receipt);
  });
}
