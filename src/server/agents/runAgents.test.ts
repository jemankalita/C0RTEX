import { describe, expect, it, vi } from "vitest";
import { runSpecializedAgents } from "@/server/agents/runAgents";
import type { LLMProvider } from "@/server/llm/provider";
import type { LoadedRepository } from "@/server/types";

const repository = {
  name: "fixture",
  files: [{ path: "src/app.ts", content: "export {};" }],
} as unknown as LoadedRepository;

describe("runSpecializedAgents", () => {
  it("skips the live review call when every parallel agent failed", async () => {
    const generateStructured = vi.fn(async () => {
      throw new Error("Gemini quota exceeded (429).");
    });
    const provider = { generateStructured } as unknown as LLMProvider;

    const agents = await runSpecializedAgents({
      repository,
      findings: [],
      contexts: [],
      provider,
      lenses: ["injection"],
    });

    expect(generateStructured).toHaveBeenCalledTimes(2);
    expect(agents.map((agent) => agent.status)).toEqual(["failed", "failed", "failed"]);
    expect(agents.at(-1)?.agent).toBe("review");
    expect(agents.at(-1)?.error).toBe("Gemini quota exceeded (429).");
  });
});
