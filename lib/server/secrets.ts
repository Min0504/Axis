/**
 * Constant-time secret comparison.
 *
 * `header === secret` string comparison short-circuits on the first differing
 * character, which in principle leaks how many leading characters matched
 * (a timing side-channel). For low-entropy or guessable secrets that enables
 * byte-by-byte brute force. node:crypto's timingSafeEqual compares the full
 * buffer regardless of content, so comparison time is independent of where
 * the difference is.
 */
import { timingSafeEqual } from "node:crypto";

export function timingSafeEqualStrings(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");

  if (bufA.length !== bufB.length) {
    // Still burn a comparison so length mismatch doesn't return "instantly".
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

/**
 * Verify `Authorization: Bearer <secret>` against an expected secret.
 * Returns false when the secret is unset — endpoints must fail closed.
 */
export function verifyBearerSecret(req: Request, expectedSecret: string | undefined | null): boolean {
  if (!expectedSecret) return false;

  const header = req.headers.get("authorization") ?? "";
  if (!header.toLowerCase().startsWith("bearer ")) return false;

  const token = header.slice(7).trim();
  if (!token) return false;

  return timingSafeEqualStrings(token, expectedSecret);
}
