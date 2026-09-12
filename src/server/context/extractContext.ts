import { maskSecretsInText } from "@/server/mask";
import type { FindingContext, LoadedRepository, RawFinding } from "@/server/types";

function snippetAround(content: string, line: number, radius = 6) {
  const lines = content.split(/\r?\n/);
  const start = Math.max(1, line - radius);
  const end = Math.min(lines.length, line + radius);
  return {
    startLine: start,
    endLine: end,
    content: maskSecretsInText(lines.slice(start - 1, end).join("\n")),
  };
}

export function extractContext(repository: LoadedRepository, finding: RawFinding): FindingContext {
  const current = repository.files.find((file) => file.path === finding.file);
  const related = repository.files.filter((file) =>
    /middleware|database|auth|test|cors|controller/i.test(file.path),
  );

  const codeSnippets = [];
  if (current) {
    codeSnippets.push({
      file: current.path,
      ...snippetAround(current.content, finding.startLine),
    });
  }
  for (const file of related.slice(0, 4)) {
    if (file.path === finding.file) continue;
    codeSnippets.push({
      file: file.path,
      startLine: 1,
      endLine: Math.min(40, file.content.split(/\r?\n/).length),
      content: maskSecretsInText(file.content.split(/\r?\n/).slice(0, 40).join("\n")),
    });
  }

  return {
    finding,
    repositorySummary: `${repository.name} is a ${repository.language} ${repository.framework ?? ""} demo with ${repository.files.length} inspected files.`,
    codeSnippets,
    relatedRoutes: repository.files.filter((file) => file.path.includes("routes")).map((file) => file.path),
    relatedMiddleware: repository.files
      .filter((file) => file.path.includes("middleware"))
      .map((file) => file.path),
    relatedTests: repository.files.filter((file) => file.path.includes("test")).map((file) => file.path),
  };
}
