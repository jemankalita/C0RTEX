class PaymentClient {
  constructor(private readonly options: { apiKey: string }) {}
}

const client = new PaymentClient({
  apiKey: "sk_demo_not_a_real_secret_123",
});

export function getPaymentClient() {
  return client;
}
