import { Order } from "../services/database";

export async function getOrder(id: string) {
  return Order.findById(id);
}
