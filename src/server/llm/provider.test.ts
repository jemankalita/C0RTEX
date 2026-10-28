import { describe, expect, it, vi } from "vitest";
import { describeProviderError, GeminiProvider, isRetryableStatus } from "@/server/llm/provider";

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

const OK_BODY = { candidates: [{ content: { parts: [{ text: '{"ok":true}' }] } }] };

describe("isRetryableStatus", () => {
  it("retries transient server errors only", () => {
    expect(isRetryableStatus(500)).toBe(true);
    expect(isRetryableStatus(503)).toBe(true);
    expect(isRetryableStatus(429)).toBe(false);
    expect(isRetryableStatus(400)).toBe(false);
    expect(isRetryableStatus(403)).toBe(false);
  });
});

describe("describeProviderError", () => {
  it("explains quota exhaustion", () => {
    expect(describeProviderError(429)).toMatch(/quota/i);
  });

  it("explains model overload", () => {
    expect(describeProviderError(503)).toMatch(/high demand/i);
  });

  it("falls back to the status code", () => {
    expect(describeProviderError(418)).toBe("Provider request failed with 418.");
  });
});

describe("GeminiProvider", () => {
  it("does not retry when the quota is exhausted", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(429, { error: { code: 429 } }));
    const provider = new GeminiProvider("key", { fetchImpl, retryDelaysMs: [0, 0] });

    await expect(provider.generateStructured("sys", "user")).rejects.toThrow(/quota/i);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("retries an overloaded model and returns the parsed JSON", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(503, { error: { code: 503 } }))
      .mockResolvedValueOnce(jsonResponse(200, OK_BODY));
    const provider = new GeminiProvider("key", { fetchImpl, retryDelaysMs: [0, 0] });

    await expect(provider.generateStructured("sys", "user")).resolves.toEqual({ ok: true });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("gives up after the configured retries", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(503, { error: { code: 503 } }));
    const provider = new GeminiProvider("key", { fetchImpl, retryDelaysMs: [0, 0] });

    await expect(provider.generateStructured("sys", "user")).rejects.toThrow(/high demand/i);
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  it("retries network failures", async () => {
    const fetchImpl = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("fetch failed"))
      .mockResolvedValueOnce(jsonResponse(200, OK_BODY));
    const provider = new GeminiProvider("key", { fetchImpl, retryDelaysMs: [0] });

    await expect(provider.generateStructured("sys", "user")).resolves.toEqual({ ok: true });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("bounds each request with a timeout signal", async () => {
    const fetchImpl = vi.fn(async (_url: string, _init?: RequestInit) => jsonResponse(200, OK_BODY));
    const provider = new GeminiProvider("key", { fetchImpl, retryDelaysMs: [] });

    await provider.generateStructured("sys", "user");
    expect(fetchImpl.mock.calls[0][1]?.signal).toBeInstanceOf(AbortSignal);
  });

  it("sends the key in a header, not the URL", async () => {
    const fetchImpl = vi.fn(async (_url: string, _init?: RequestInit) => jsonResponse(200, OK_BODY));
    const provider = new GeminiProvider("secret-key", { fetchImpl, retryDelaysMs: [] });

    await provider.generateStructured("sys", "user");
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).not.toContain("secret-key");
    expect((init?.headers as Record<string, string>)["x-goog-api-key"]).toBe("secret-key");
  });
});
