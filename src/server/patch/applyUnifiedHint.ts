export function applyUnifiedHint(source: string, patch: string) {
  const removals = patch
    .split("\n")
    .filter((line) => line.startsWith("-") && !line.startsWith("---"))
    .map((line) => line.slice(1).trimStart());
  const additions = patch
    .split("\n")
    .filter((line) => line.startsWith("+") && !line.startsWith("+++"))
    .map((line) => line.slice(1));

  let next = source;
  for (const removal of removals) {
    if (!removal) continue;
    if (!next.includes(removal)) {
      return { ok: false as const };
    }
    next = next.replace(removal, additions.filter(Boolean).join("\n") || "");
    break;
  }
  return { ok: true as const, content: next };
}
