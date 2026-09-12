import { parseGitHubRepoUrl } from "@/lib/githubUrl";
import type { LoadedRepository, RepositoryFile } from "@/server/types";

const SKIP_DIRS = new Set(["node_modules", ".git", "dist", "build", "coverage", ".next", "vendor", "out"]);
const ALLOWED_EXT = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".mjs",
  ".cjs",
  ".json",
  ".py",
  ".go",
  ".rb",
  ".php",
  ".java",
  ".cs",
  ".vue",
  ".svelte",
  ".html",
]);
const MAX_FILES = 80;
const MAX_FILE_BYTES = 120_000;

type GitHubRepo = {
  default_branch?: string;
  full_name?: string;
};

type GitHubTree = {
  tree?: Array<{
    path?: string;
    type?: string;
    size?: number;
  }>;
};

function isAllowedPath(filePath: string) {
  const parts = filePath.split("/");
  if (parts.some((part) => SKIP_DIRS.has(part))) return false;
  const dot = filePath.lastIndexOf(".");
  if (dot === -1) return false;
  return ALLOWED_EXT.has(filePath.slice(dot));
}

async function githubJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "C0RTEX-authorized-scanner",
    },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`GitHub request failed with ${response.status}.`);
  }
  return (await response.json()) as T;
}

async function githubText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: { "User-Agent": "C0RTEX-authorized-scanner" },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`GitHub file request failed with ${response.status}.`);
  }
  return response.text();
}

export async function loadGitHubRepository(repositoryUrl: string): Promise<LoadedRepository> {
  const parsed = parseGitHubRepoUrl(repositoryUrl);
  if (!parsed) {
    throw new Error("Enter a valid GitHub repository URL.");
  }

  const repo = await githubJson<GitHubRepo>(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`);
  const branch = repo.default_branch || "main";
  const tree = await githubJson<GitHubTree>(
    `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
  );

  const candidates = (tree.tree ?? [])
    .filter((entry) => entry.type === "blob" && entry.path && isAllowedPath(entry.path) && (entry.size ?? 0) <= MAX_FILE_BYTES)
    .slice(0, MAX_FILES);

  const files: RepositoryFile[] = [];
  const chunkSize = 8;
  for (let index = 0; index < candidates.length; index += chunkSize) {
    const chunk = candidates.slice(index, index + chunkSize);
    const loaded = await Promise.all(
      chunk.map(async (entry) => {
        const path = entry.path!;
        const rawUrl = `https://raw.githubusercontent.com/${parsed.owner}/${parsed.repo}/${encodeURIComponent(branch)}/${path
          .split("/")
          .map(encodeURIComponent)
          .join("/")}`;
        try {
          return { path, content: await githubText(rawUrl) };
        } catch {
          return null;
        }
      }),
    );
    files.push(...loaded.filter((file): file is RepositoryFile => file !== null));
  }

  if (files.length === 0) {
    throw new Error("No readable source files were found in that GitHub repository.");
  }

  return {
    id: `${parsed.owner}/${parsed.repo}`,
    name: repo.full_name ?? `${parsed.owner}/${parsed.repo}`,
    language: "mixed",
    files,
    metadata: {
      language: "mixed",
      fileCount: files.length,
    },
  };
}
