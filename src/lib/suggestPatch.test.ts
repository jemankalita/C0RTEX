import { describe, expect, it } from "vitest";
import { applyUnifiedHint } from "@/lib/applyUnifiedHint";
import { suggestPatch } from "@/lib/suggestPatch";

describe("suggestPatch", () => {
  it("builds a patch from the real file line so GitHub copies can be saved", () => {
    const source = `export function pay() {\n  fetch(req.query.url);\n}\n`;
    const suggestion = suggestPatch(
      {
        ruleId: "ssrf",
        snippet: "fetch(req.query.url)",
        line: 2,
      },
      source,
    );

    expect(suggestion.patch).toContain("-");
    const applied = applyUnifiedHint(source, suggestion.patch);
    expect(applied.ok).toBe(true);
    if (applied.ok) {
      expect(applied.content).toContain("allowListedUrl");
    }
  });
});
