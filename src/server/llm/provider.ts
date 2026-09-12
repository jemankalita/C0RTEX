import { getServerEnv } from "@/server/env";

export interface LLMProvider {
  generateStructured<T>(systemPrompt: string, userPrompt: string): Promise<T>;
}

function extractJson(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Model returned no JSON object.");
  return JSON.parse(text.slice(start, end + 1)) as unknown;
}

class GeminiProvider implements LLMProvider {
  constructor(private readonly apiKey: string) {}

  async generateStructured<T>(systemPrompt: string, userPrompt: string): Promise<T> {
    const request = async () => {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: "user", parts: [{ text: userPrompt }] }],
            generationConfig: {
              temperature: 0.1,
              responseMimeType: "application/json",
            },
          }),
        },
      );
      if (!response.ok) {
        throw new Error(`Provider request failed with ${response.status}.`);
      }
      const payload = (await response.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
      return extractJson(text) as T;
    };

    try {
      return await request();
    } catch {
      return await request();
    }
  }
}

export function getLLMProvider(): LLMProvider | null {
  const env = getServerEnv();
  if (!env.liveEnabled) return null;
  return new GeminiProvider(env.geminiKey);
}
