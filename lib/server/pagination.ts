/**
 * Cursor (keyset) pagination helpers.
 *
 * OFFSET pagination degrades linearly (`OFFSET 10000` scans 10k rows) and
 * skips/duplicates items when rows are inserted between pages. Keyset
 * pagination instead remembers WHERE the last page ended ("created_at <
 * cursor") and uses an index seek — O(page size) regardless of depth, and
 * stable under concurrent inserts.
 *
 * The cursor is an opaque base64url token so clients can't depend on its
 * internals; the server is free to change the encoding.
 */

export type HistoryCursor = {
  /** ISO timestamp of the last row on the previous page. */
  createdAt: string;
  /** Row id — tie-breaker so identical timestamps still order deterministically. */
  id: string;
};

export function encodeCursor(cursor: HistoryCursor): string {
  return Buffer.from(JSON.stringify(cursor), "utf8").toString("base64url");
}

/** Returns null for anything malformed — a bad cursor is a client error, not a crash. */
export function decodeCursor(raw: string): HistoryCursor | null {
  try {
    const parsed: unknown = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
    if (
      typeof parsed === "object" && parsed !== null &&
      typeof (parsed as Record<string, unknown>).createdAt === "string" &&
      typeof (parsed as Record<string, unknown>).id === "string"
    ) {
      const candidate = parsed as HistoryCursor;
      // Reject garbage timestamps early instead of sending them to the DB.
      if (Number.isNaN(Date.parse(candidate.createdAt))) return null;
      return candidate;
    }
    return null;
  } catch {
    return null;
  }
}

/** Parse a user-supplied limit with default/max clamping. */
export function clampLimit(raw: string | null | undefined, def: number, max: number): number {
  if (!raw) return def;
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed < 1) return def;
  return Math.min(parsed, max);
}
