/**
 * Parses a line name string of the form "Name1|Name2||InternalExtra".
 * - Everything after `||` is stripped (internal/extra data).
 * - The visible portion is split by `|` into language variants.
 * Returns an array of non-empty name parts.
 */
export function parseLineName(raw: string): string[] {
  const visible = raw.split("||")[0];
  return visible
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
}
