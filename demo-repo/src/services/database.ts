export const db = {
  async query(sql: string, _params?: unknown[]) {
    return [{ sql }];
  },
};

export const Order = {
  async findById(id: string) {
    return {
      id,
      userId: "user-2",
      total: 42,
      items: [{ sku: "mug-01", qty: 1 }],
      shippingAddress: "12 Harbor Lane",
    };
  },
  async findOne(filter: { _id: string; userId: string }) {
    return { id: filter._id, userId: filter.userId, total: 42 };
  },
};

export const User = {
  async findById(id: string) {
    return { id, email: "customer@example.com", role: "customer" };
  },
  async update(id: string, fields: Record<string, unknown>) {
    return { id, ...fields };
  },
};
