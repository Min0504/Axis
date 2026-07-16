/**
 * Sanitize user comparison queries before exposing them on the public homepage.
 * Rejects emails, phones, overly long free text, and non-comparison phrases.
 */

const MAX_QUERY_LEN = 80;
const MIN_QUERY_LEN = 5;

const UNSAFE =
  /@|\b\d{2,4}[-.\s]?\d{3,4}[-.\s]?\d{4}\b|비밀번호|주민|계좌|주소|내\s*이메일|신용카드/i;

const COMPARISON_SEP = /\s*(?:\bvs\b|대비|대)\s*/i;

export function normalizePopularQuery(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").toLowerCase();
}

export function isSafePublicQuery(raw: string): boolean {
  const q = normalizePopularQuery(raw);
  if (q.length < MIN_QUERY_LEN || q.length > MAX_QUERY_LEN) return false;
  if (UNSAFE.test(q)) return false;
  const parts = q.split(COMPARISON_SEP).map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2) return false;
  // Each side should look like a short product name, not a paragraph.
  if (parts.some((p) => p.length > 40 || p.split(/\s+/).length > 6)) return false;
  return true;
}

export function aggregatePopularQueries(
  rows: Array<{ query: string | null }>,
  limit: number
): Array<{ query: string; count: number }> {
  const counts = new Map<string, number>();
  for (const row of rows) {
    if (!row.query || !isSafePublicQuery(row.query)) continue;
    const q = normalizePopularQuery(row.query);
    counts.set(q, (counts.get(q) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([query, count]) => ({ query, count }));
}
