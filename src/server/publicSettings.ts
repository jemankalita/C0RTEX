import { getServerEnv } from "@/server/env";
import type { PublicSettings } from "@/types/settings";

export type { PublicSettings };

export function getPublicSettings(): PublicSettings {
  const env = getServerEnv();
  const configured = env.geminiKey.length > 0 && env.provider === "gemini";
  return {
    liveEnabled: env.liveEnabled,
    analysisMode: env.liveEnabled ? "live" : "demo",
    provider: env.provider,
    configured,
  };
}
