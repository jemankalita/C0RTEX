import { afterEach, describe, expect, it } from "vitest";
import { getPublicSettings } from "@/server/publicSettings";

const KEYS = ["LLM_PROVIDER", "GEMINI_API_KEY", "ENABLE_LIVE_ANALYSIS"] as const;

const snapshot = Object.fromEntries(KEYS.map((key) => [key, process.env[key]]));

afterEach(() => {
  for (const key of KEYS) {
    if (snapshot[key] === undefined) delete process.env[key];
    else process.env[key] = snapshot[key];
  }
});

describe("getPublicSettings", () => {
  it("reports live analysis when a Gemini key is configured", () => {
    process.env.LLM_PROVIDER = "gemini";
    process.env.GEMINI_API_KEY = "test-key-value";
    process.env.ENABLE_LIVE_ANALYSIS = "true";

    const settings = getPublicSettings();
    expect(settings).toEqual({
      liveEnabled: true,
      analysisMode: "live",
      provider: "gemini",
      configured: true,
    });
    expect(JSON.stringify(settings)).not.toContain("test-key-value");
  });

  it("reports demo analysis when no API key is present", () => {
    process.env.LLM_PROVIDER = "gemini";
    process.env.GEMINI_API_KEY = "";
    delete process.env.ENABLE_LIVE_ANALYSIS;

    const settings = getPublicSettings();
    expect(settings.liveEnabled).toBe(false);
    expect(settings.analysisMode).toBe("demo");
    expect(settings.configured).toBe(false);
  });
});
