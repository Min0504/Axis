/** Returns the URL only if it is a well-formed http(s) URL; otherwise undefined.
 *  Guards against javascript:, data:, and malformed values before rendering as a link. */
export function safeHttpUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  try {
    const u = new URL(trimmed);
    if (u.protocol === "http:" || u.protocol === "https:") {
      return u.toString();
    }
  } catch {
    // not a valid URL
  }
  return undefined;
}
