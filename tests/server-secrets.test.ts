import { describe, it, expect } from "vitest";
import { timingSafeEqualStrings, verifyBearerSecret } from "@/lib/server/secrets";

describe("timingSafeEqualStrings", () => {
  it("returns true only for identical strings", () => {
    expect(timingSafeEqualStrings("secret-123", "secret-123")).toBe(true);
    expect(timingSafeEqualStrings("secret-123", "secret-124")).toBe(false);
    expect(timingSafeEqualStrings("", "")).toBe(true);
  });

  it("handles different lengths without throwing", () => {
    expect(timingSafeEqualStrings("short", "much-longer-secret")).toBe(false);
    expect(timingSafeEqualStrings("x", "")).toBe(false);
  });

  it("compares multibyte strings byte-wise", () => {
    expect(timingSafeEqualStrings("한글비밀", "한글비밀")).toBe(true);
    expect(timingSafeEqualStrings("한글비밀", "한글비번")).toBe(false);
  });
});

describe("verifyBearerSecret", () => {
  const req = (auth?: string) =>
    new Request("http://test.local/api/cron/x", {
      headers: auth ? { Authorization: auth } : {}
    });

  it("fails closed when the expected secret is unset", () => {
    expect(verifyBearerSecret(req("Bearer anything"), undefined)).toBe(false);
    expect(verifyBearerSecret(req("Bearer anything"), "")).toBe(false);
  });

  it("rejects missing or non-Bearer Authorization headers", () => {
    expect(verifyBearerSecret(req(), "s3cret")).toBe(false);
    expect(verifyBearerSecret(req("Basic dXNlcg=="), "s3cret")).toBe(false);
    expect(verifyBearerSecret(req("Bearer "), "s3cret")).toBe(false);
  });

  it("accepts the correct token, scheme case-insensitively", () => {
    expect(verifyBearerSecret(req("Bearer s3cret"), "s3cret")).toBe(true);
    expect(verifyBearerSecret(req("bearer s3cret"), "s3cret")).toBe(true);
  });

  it("rejects wrong tokens", () => {
    expect(verifyBearerSecret(req("Bearer nope"), "s3cret")).toBe(false);
  });
});
