import { afterEach, describe, expect, it, vi } from "vitest";
import { loadGitHubRepository } from "@/server/repository/loadGitHubRepository";

describe("loadGitHubRepository", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads allowed source files from a public GitHub repository", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes("/repos/acme/shop") && !url.includes("/git/trees")) {
          return new Response(JSON.stringify({ default_branch: "main", full_name: "acme/shop" }));
        }
        if (url.includes("/git/trees/main")) {
          return new Response(
            JSON.stringify({
              tree: [
                { path: "src/app.ts", type: "blob", size: 80 },
                { path: "node_modules/pkg/index.js", type: "blob", size: 80 },
                { path: "logo.png", type: "blob", size: 80 },
              ],
            }),
          );
        }
        if (url.includes("raw.githubusercontent.com/acme/shop/main/src/app.ts")) {
          return new Response("export const token = 'sk_live_demo_secret_value';\n");
        }
        return new Response("missing", { status: 404 });
      }),
    );

    const repository = await loadGitHubRepository("https://github.com/acme/shop");
    expect(repository.name).toBe("acme/shop");
    expect(repository.files).toEqual([
      {
        path: "src/app.ts",
        content: "export const token = 'sk_live_demo_secret_value';\n",
      },
    ]);
  });

  it("rejects an invalid GitHub URL", async () => {
    await expect(loadGitHubRepository("https://example.com/acme/shop")).rejects.toThrow(
      "Enter a valid GitHub repository URL.",
    );
  });
});
