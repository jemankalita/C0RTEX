import { describe, expect, it } from "vitest";
import { applyUnifiedHint } from "@/lib/applyUnifiedHint";

describe("applyUnifiedHint", () => {
  it("replaces a trimmed matching line when indent differs", () => {
    const source = `export function load() {\n  const key = "sk_live_demo_key_123";\n  return key;\n}\n`;
    const patch = `- const key = "sk_live_demo_key_123";\n+ const key = process.env.SERVICE_SECRET ?? "";`;
    const applied = applyUnifiedHint(source, patch);
    expect(applied.ok).toBe(true);
    if (applied.ok) {
      expect(applied.content).toContain("process.env.SERVICE_SECRET");
      expect(applied.content).not.toContain("sk_live_demo_key_123");
    }
  });

  it("fails only when no removal can be found", () => {
    const applied = applyUnifiedHint("const ok = true;", "- missing-line\n+ next");
    expect(applied.ok).toBe(false);
  });
});
