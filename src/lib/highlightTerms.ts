export function highlightTerms(source: string, terms: string[]): Array<{ text: string; marked: boolean }> {
  if (terms.length === 0) {
    return [{ text: source, marked: false }];
  }

  const unique = [...new Set(terms.filter(Boolean))].sort((left, right) => right.length - left.length);
  const escaped = unique.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(${escaped.join("|")})`, "g");
  return source.split(pattern).map((part) => ({
    text: part,
    marked: unique.includes(part),
  }));
}
