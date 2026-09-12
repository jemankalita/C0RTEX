function parseHunk(patch: string) {
  const removals = patch
    .split("\n")
    .filter((line) => line.startsWith("-") && !line.startsWith("---"))
    .map((line) => line.slice(1).replace(/^\s/, ""));
  const additions = patch
    .split("\n")
    .filter((line) => line.startsWith("+") && !line.startsWith("+++"))
    .map((line) => line.slice(1).replace(/^\s/, ""));
  return { removals, additions };
}

function replaceLine(source: string, index: number, replacementLines: string[]) {
  const lines = source.split(/\r?\n/);
  const indent = lines[index]?.match(/^\s*/)?.[0] ?? "";
  const nextLines = [
    ...lines.slice(0, index),
    ...replacementLines.map((line) => (line.length > 0 ? `${indent}${line}` : line)),
    ...lines.slice(index + 1),
  ];
  return nextLines.join("\n");
}

export function applyUnifiedHint(source: string, patch: string) {
  const { removals, additions } = parseHunk(patch);
  const replacement = additions.length > 0 ? additions : [""];

  for (const removal of removals) {
    if (!removal.trim()) continue;
    if (source.includes(removal)) {
      return { ok: true as const, content: source.replace(removal, replacement.join("\n")) };
    }

    const lines = source.split(/\r?\n/);
    const index = lines.findIndex(
      (line) => line.trim() === removal.trim() || line.includes(removal.trim()),
    );
    if (index === -1) continue;
    return { ok: true as const, content: replaceLine(source, index, replacement) };
  }

  return { ok: false as const };
}
