import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { LoadedRepository, RepositoryFile } from "@/server/types";

const SKIP_DIRS = new Set(["node_modules", ".git", "dist", "build", "coverage", ".next"]);
const ALLOWED_EXT = new Set([".js", ".jsx", ".ts", ".tsx", ".json"]);

async function walk(root: string, current: string): Promise<RepositoryFile[]> {
  const entries = await readdir(current, { withFileTypes: true });
  const files: RepositoryFile[] = [];

  for (const entry of entries) {
    const absolute = path.join(current, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      files.push(...(await walk(root, absolute)));
      continue;
    }
    if (!ALLOWED_EXT.has(path.extname(entry.name))) continue;
    const relative = path.relative(root, absolute).replaceAll("\\", "/");
    files.push({
      path: relative,
      content: await readFile(absolute, "utf8"),
    });
  }

  return files;
}

export async function loadExistingDemoRepository(): Promise<LoadedRepository> {
  return loadDemoRepository();
}

export async function loadDemoRepository(): Promise<LoadedRepository> {
  const root = path.join(process.cwd(), "demo-repo");
  const files = await walk(root, root);
  return {
    id: "vulnerable-shop",
    name: "vulnerable-shop",
    language: "TypeScript",
    framework: "Express",
    files,
    metadata: {
      language: "TypeScript",
      framework: "Express",
      fileCount: files.length,
    },
  };
}
