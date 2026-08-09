/**
 * Admin gate for /api/admin/* routes.
 *
 * - AXIS_ADMIN must be "1" or the route 404s (hidden when off).
 * - In production (VERCEL_ENV=production), AXIS_ADMIN_TOKEN is required and
 *   must match `Authorization: Bearer <token>`.
 * - Outside production, token is enforced only when AXIS_ADMIN_TOKEN is set
 *   (keeps local/dev usable with AXIS_ADMIN=1 alone).
 */
export function isAdminRequest(req: Request): boolean {
  if (process.env.AXIS_ADMIN !== "1") return false;

  const token = process.env.AXIS_ADMIN_TOKEN?.trim();
  const auth = req.headers.get("authorization") ?? "";
  const expected = token ? `Bearer ${token}` : null;
  const isProd = process.env.VERCEL_ENV === "production";

  if (isProd) {
    return Boolean(expected && auth === expected);
  }

  if (expected) {
    return auth === expected;
  }

  return true;
}
