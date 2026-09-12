export const db = {
  async query(sql: string, _params?: unknown[]) {
    return [{ sql }];
  },
};

export const Order = {
  async findById(id: string) {
    return { id, userId: "user-2", total: 42 };
  },
  async findOne(filter: { _id: string; userId: string }) {
    return { id: filter._id, userId: filter.userId, total: 42 };
  },
};
