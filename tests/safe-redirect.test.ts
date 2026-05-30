import { describe, expect, it } from "vitest";
import { safeNextPath } from "@/lib/auth/safe-redirect";

describe("safeNextPath", () => {
  it("allows relative paths", () => {
    expect(safeNextPath("/")).toBe("/");
    expect(safeNextPath("/results?historyId=1")).toBe("/results?historyId=1");
  });

  it("falls back to / for null/undefined/empty", () => {
    expect(safeNextPath(null)).toBe("/");
    expect(safeNextPath(undefined)).toBe("/");
    expect(safeNextPath("")).toBe("/");
  });

  it("blocks protocol-relative urls", () => {
    expect(safeNextPath("//evil.com")).toBe("/");
  });

  it("blocks userinfo / absolute-url open-redirect tricks", () => {
    expect(safeNextPath("@evil.com")).toBe("/");
    expect(safeNextPath("https://evil.com")).toBe("/");
    expect(safeNextPath("evil.com")).toBe("/");
  });

  it("blocks backslash tricks", () => {
    expect(safeNextPath("/\\evil.com")).toBe("/");
  });
});
