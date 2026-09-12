import { describe, expect, it } from "vitest";
import { isValidGitHubRepoUrl } from "@/lib/githubUrl";

describe("isValidGitHubRepoUrl", () => {
  it("accepts a standard GitHub repository URL", () => {
    expect(isValidGitHubRepoUrl("https://github.com/acme/vulnerable-shop")).toBe(true);
  });

  it("rejects live targets and invalid URLs", () => {
    expect(isValidGitHubRepoUrl("https://example.com")).toBe(false);
    expect(isValidGitHubRepoUrl("github.com/acme/shop")).toBe(false);
    expect(isValidGitHubRepoUrl("https://github.com/acme")).toBe(false);
  });
});
