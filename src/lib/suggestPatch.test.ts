import { describe, expect, it } from "vitest";
import { applyUnifiedHint } from "@/server/patch/applyUnifiedHint";
import { suggestPatch } from "@/lib/suggestPatch";

describe("suggestPatch", () => {
  it("builds an applyable secret replacement", () => {
    const source = `const client = new PaymentClient({ apiKey: "sk_live_demo_key_123" });`;
    const suggestion = suggestPatch({
      ruleId: "hardcoded-secret",
      snippet: `apiKey: "sk_live_demo_key_123"`,
      codeBefore: source,
    });

    expect(suggestion.patch).toContain("-");
    expect(suggestion.patch).toContain("+");
    const applied = applyUnifiedHint(source, suggestion.patch);
    expect(applied.ok).toBe(true);
    if (applied.ok) {
      expect(applied.content).toContain("process.env");
      expect(applied.content).not.toContain("sk_live_demo_key_123");
    }
  });

  it("keeps an existing reviewable patch", () => {
    const suggestion = suggestPatch({
      ruleId: "sql-injection",
      snippet: "db.query(`SELECT * FROM items WHERE name LIKE '%${req.query.q}%'`)",
      patch: "- old\n+ new",
      patchExplanation: "Use a parameterized query.",
    });

    expect(suggestion.patch).toBe("- old\n+ new");
    expect(suggestion.patchExplanation).toBe("Use a parameterized query.");
  });
});
