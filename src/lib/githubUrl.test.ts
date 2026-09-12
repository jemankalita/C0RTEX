import { describe, expect, it } from "vitest";
import { isValidGitHubRepoUrl, parseGitHubRepoUrl } from "@/lib/githubUrl";

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

describe("parseGitHubRepoUrl", () => {
  it("reads owner and repo from a github.com URL", () => {
    expect(parseGitHubRepoUrl("https://github.com/okaylol676767-eng/democortextest")).toEqual({
      owner: "okaylol676767-eng",
      repo: "democortextest",
    });
  });

  it("strips a trailing .git suffix", () => {
    expect(parseGitHubRepoUrl("https://github.com/acme/shop.git")).toEqual({
      owner: "acme",
      repo: "shop",
    });
  });
});
