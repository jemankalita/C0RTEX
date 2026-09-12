import { describe, expect, it } from "vitest";
import { findingsForLenses, selectThreatLenses } from "@/server/lenses";
import type { LoadedRepository, RawFinding } from "@/server/types";

const emptyRepo: LoadedRepository = {
  id: "empty",
  name: "empty",
  language: "TypeScript",
  files: [{ path: "README.md", content: "# hi" }],
  metadata: { language: "TypeScript", fileCount: 1 },
};

const xss: RawFinding = {
  id: "unsafe-html",
  ruleId: "unsafe-html",
  category: "Injection/XSS",
  title: "Unsafe HTML rendering",
  file: "src/App.tsx",
  startLine: 2,
  endLine: 2,
  snippet: "dangerouslySetInnerHTML",
  confidence: 0.8,
};

describe("selectThreatLenses", () => {
  it("falls back to every lens when the repository has no signals", () => {
    expect(selectThreatLenses(emptyRepo, [])).toEqual([
      "access-control",
      "injection",
      "browser-safety",
      "secrets",
      "configuration",
    ]);
  });
});

describe("findingsForLenses", () => {
  it("keeps browser-safety findings and does not drop them", () => {
    expect(findingsForLenses([xss], ["browser-safety"]).map((item) => item.id)).toEqual(["unsafe-html"]);
  });

  it("returns the original findings when the lens filter matches nothing", () => {
    expect(findingsForLenses([xss], ["secrets"])).toEqual([xss]);
  });
});
