const GITHUB_URL_PATTERN =
  /^https:\/\/(www\.)?github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?\/?$/;

export function parseGitHubRepoUrl(value: string): { owner: string; repo: string } | null {
  const match = value.trim().match(GITHUB_URL_PATTERN);
  if (!match) return null;
  return { owner: match[2], repo: match[3] };
}

export function isValidGitHubRepoUrl(value: string): boolean {
  return parseGitHubRepoUrl(value) !== null;
}
