import { getServerEnv } from "@/server/env";

export interface LLMProvider {
  generateStructured<T>(systemPrompt: string, userPrompt: string): Promise<T>;
}

const GEMINI_MODEL = "gemini-3.6-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
// Backoff before each retry of a transient failure (overload, 5xx, network).
const DEFAULT_RETRY_DELAYS_MS = [1500, 4000];
const REQUEST_TIMEOUT_MS = 20_000;

function extractJson(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Model returned no JSON object.");
  return JSON.parse(text.slice(start, end + 1)) as unknown;
}

// 429 means the key's rate or daily quota is used up; retrying only burns more quota.
export function isRetryableStatus(status: number) {
  return status >= 500;
}

export function describeProviderError(status: number) {
  if (status === 429) {
    return "Gemini quota exceeded (429). The API key's rate or daily limit is used up.";
  }
  if (status === 503) {
    return "Gemini is under high demand (503). Try the scan again shortly.";
  }
  return `Provider request failed with ${status}.`;
}

class ProviderError extends Error {
  constructor(
    message: string,
    readonly retryable: boolean,
  ) {
    super(message);
  }
}

type GeminiOptions = {
  fetchImpl?: (url: string, init?: RequestInit) => Promise<Response>;
  retryDelaysMs?: number[];
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class GeminiProvider implements LLMProvider {
  private readonly fetchImpl: NonNullable<GeminiOptions["fetchImpl"]>;
  private readonly retryDelaysMs: number[];

  constructor(
    private readonly apiKey: string,
    options: GeminiOptions = {},
  ) {
    this.fetchImpl = options.fetchImpl ?? ((url, init) => fetch(url, init));
    this.retryDelaysMs = options.retryDelaysMs ?? DEFAULT_RETRY_DELAYS_MS;
  }

  private async request<T>(systemPrompt: string, userPrompt: string): Promise<T> {
    let response: Response;
    try {
      response = await this.fetchImpl(GEMINI_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": this.apiKey },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json",
          },
        }),
      });
    } catch {
      throw new ProviderError("Could not reach Gemini or the request timed out.", true);
    }
    if (!response.ok) {
      throw new ProviderError(describeProviderError(response.status), isRetryableStatus(response.status));
    }
    const payload = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
    return extractJson(text) as T;
  }

  async generateStructured<T>(systemPrompt: string, userPrompt: string): Promise<T> {
    for (let attempt = 0; ; attempt += 1) {
      try {
        return await this.request<T>(systemPrompt, userPrompt);
      } catch (error) {
        const canRetry = error instanceof ProviderError && error.retryable && attempt < this.retryDelaysMs.length;
        if (!canRetry) throw error;
        await wait(this.retryDelaysMs[attempt]);
      }
    }
  }
}

export function getLLMProvider(): LLMProvider | null {
  const env = getServerEnv();
  if (!env.liveEnabled) return null;
  return new GeminiProvider(env.geminiKey);
}
