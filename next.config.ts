import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const projectRoot = dirname(fileURLToPath(import.meta.url));

// Baseline security headers. NOTE: a strict Content-Security-Policy is
// intentionally omitted here — Next.js injects inline bootstrap scripts that
// require nonce-based CSP plumbing (via proxy), and Supabase needs connect-src
// allowances. Add CSP separately once it can be tested end-to-end.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }
];

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  // Pin the workspace root so Next doesn't pick up an unrelated parent lockfile.
  turbopack: {
    root: projectRoot
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders
      }
    ];
  }
};

export default nextConfig;
