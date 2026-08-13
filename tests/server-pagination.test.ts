import { describe, it, expect } from "vitest";
import { encodeCursor, decodeCursor, clampLimit } from "@/lib/server/pagination";

describe("cursor encode/decode", () => {
  it("round-trips a cursor", () => {
    const cursor = { createdAt: "2026-08-13T07:00:00.000Z", id: "b3f1c9e2-1111-4222-8333-444455556666" };
    expect(decodeCursor(encodeCursor(cursor))).toEqual(cursor);
  });

  it("produces URL-safe tokens (no +, /, =)", () => {
    const token = encodeCursor({ createdAt: "2026-08-13T07:00:00.000Z", id: "abc" });
    expect(token).not.toMatch(/[+/=]/);
  });

  it("rejects garbage input", () => {
    expect(decodeCursor("not-base64-json")).toBeNull();
    expect(decodeCursor("")).toBeNull();
  });

  it("rejects structurally valid JSON with the wrong shape", () => {
    const wrongShape = Buffer.from(JSON.stringify({ foo: 1 })).toString("base64url");
    expect(decodeCursor(wrongShape)).toBeNull();
    const missingId = Buffer.from(JSON.stringify({ createdAt: "2026-01-01T00:00:00Z" })).toString("base64url");
    expect(decodeCursor(missingId)).toBeNull();
  });

  it("rejects unparseable timestamps (never sent to the DB)", () => {
    const badDate = Buffer.from(JSON.stringify({ createdAt: "yesterday-ish", id: "x" })).toString("base64url");
    expect(decodeCursor(badDate)).toBeNull();
  });
});

describe("clampLimit", () => {
  it("uses the default for missing/invalid values", () => {
    expect(clampLimit(null, 10, 50)).toBe(10);
    expect(clampLimit(undefined, 10, 50)).toBe(10);
    expect(clampLimit("abc", 10, 50)).toBe(10);
    expect(clampLimit("0", 10, 50)).toBe(10);
    expect(clampLimit("-5", 10, 50)).toBe(10);
  });

  it("parses valid limits and clamps to max", () => {
    expect(clampLimit("25", 10, 50)).toBe(25);
    expect(clampLimit("999", 10, 50)).toBe(50);
    expect(clampLimit("1", 10, 50)).toBe(1);
  });
});
