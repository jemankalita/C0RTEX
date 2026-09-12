export function getServerEnv() {
  const provider = process.env.LLM_PROVIDER ?? "gemini";
  const geminiKey = process.env.GEMINI_API_KEY ?? "";
  const concurrency = Number(process.env.MAX_AGENT_CONCURRENCY ?? "5");
  const liveRequested = process.env.ENABLE_LIVE_ANALYSIS !== "false";
  const liveEnabled = liveRequested && geminiKey.length > 0 && provider === "gemini";

  return {
    provider,
    geminiKey,
    concurrency: Number.isFinite(concurrency) && concurrency > 0 ? concurrency : 5,
    liveEnabled,
  };
}

export function maskSecret(value: string) {
  if (value.length < 8) return "••••";
  return `${value.slice(0, 3)}••••${value.slice(-2)}`;
}
