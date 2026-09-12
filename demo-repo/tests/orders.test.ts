it("returns an order for an authenticated user", async () => {
  const response = await request(app).get("/api/orders/1").set("Authorization", token);
  expect(response.status).toBe(200);
});
