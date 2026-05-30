/**
 * Returns a safe, same-origin relative redirect path.
 *
 * Guards against open-redirect tricks when a value is later concatenated as
 * `${origin}${next}`:
 *  - must be a relative path starting with "/"
 *  - not protocol-relative ("//evil.com")
 *  - no backslash ("/\\evil.com", which some browsers normalize to "//")
 * Anything else (including "@evil.com" or "https://evil.com") falls back to "/".
 */
export function safeNextPath(next: string | null | undefined): string {
  if (typeof next !== "string") return "/";
  if (!next.startsWith("/")) return "/";
  if (next.startsWith("//")) return "/";
  if (next.includes("\\")) return "/";
  return next;
}
