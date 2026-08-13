import { describe, it, expect } from "vitest";
import { v, formatIssues, type Infer } from "@/lib/server/validate";

describe("v.string", () => {
  it("accepts strings and enforces min/max", () => {
    expect(v.string({ min: 2, max: 4 }).parse("abc")).toEqual({ ok: true, value: "abc" });
    expect(v.string({ min: 2 }).parse("a").ok).toBe(false);
    expect(v.string({ max: 2 }).parse("abc").ok).toBe(false);
  });

  it("rejects non-strings", () => {
    expect(v.string().parse(123).ok).toBe(false);
    expect(v.string().parse(null).ok).toBe(false);
    expect(v.string().parse(undefined).ok).toBe(false);
  });

  it("trims before validating when trim is set", () => {
    const result = v.string({ trim: true, min: 3 }).parse("  ab  ");
    expect(result.ok).toBe(false); // "ab" after trim → below min
    expect(v.string({ trim: true }).parse("  ab  ")).toEqual({ ok: true, value: "ab" });
  });

  it("validates email format", () => {
    expect(v.string({ email: true }).parse("a@b.co").ok).toBe(true);
    expect(v.string({ email: true }).parse("not-an-email").ok).toBe(false);
  });
});

describe("v.number", () => {
  it("accepts finite numbers and enforces bounds", () => {
    expect(v.number({ min: 0 }).parse(5)).toEqual({ ok: true, value: 5 });
    expect(v.number({ min: 0 }).parse(-1).ok).toBe(false);
    expect(v.number({ max: 10 }).parse(11).ok).toBe(false);
  });

  it("rejects NaN, Infinity and non-numbers", () => {
    expect(v.number().parse(NaN).ok).toBe(false);
    expect(v.number().parse(Infinity).ok).toBe(false);
    expect(v.number().parse("5").ok).toBe(false);
  });

  it("enforces int", () => {
    expect(v.number({ int: true }).parse(1.5).ok).toBe(false);
    expect(v.number({ int: true }).parse(2).ok).toBe(true);
  });
});

describe("v.enum", () => {
  const region = v.enum(["US", "KR", "JP"]);

  it("accepts listed values only", () => {
    expect(region.parse("KR")).toEqual({ ok: true, value: "KR" });
    expect(region.parse("FR").ok).toBe(false);
    expect(region.parse(1).ok).toBe(false);
  });
});

describe("v.object", () => {
  const schema = v.object({
    name: v.string({ min: 1 }),
    age: v.optional(v.number({ min: 0 }))
  });

  it("parses valid objects and infers types", () => {
    const result = schema.parse({ name: "kim", age: 20 });
    expect(result).toEqual({ ok: true, value: { name: "kim", age: 20 } });
    // Compile-time check: Infer recovers the exact shape.
    type Shape = Infer<typeof schema>;
    const typed: Shape = { name: "x" };
    expect(typed.name).toBe("x");
  });

  it("allows optional keys to be absent", () => {
    expect(schema.parse({ name: "kim" })).toEqual({ ok: true, value: { name: "kim" } });
  });

  it("reports missing required keys with paths", () => {
    const result = schema.parse({});
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0]).toEqual({ path: "name", message: "required" });
    }
  });

  it("STRIPS unknown keys (mass-assignment protection)", () => {
    const result = schema.parse({ name: "kim", isAdmin: true });
    expect(result).toEqual({ ok: true, value: { name: "kim" } });
  });

  it("rejects arrays and null", () => {
    expect(schema.parse([]).ok).toBe(false);
    expect(schema.parse(null).ok).toBe(false);
  });

  it("builds dotted paths for nested failures", () => {
    const nested = v.object({ user: v.object({ email: v.string({ email: true }) }) });
    const result = nested.parse({ user: { email: "nope" } });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0].path).toBe("user.email");
    }
  });
});

describe("v.array", () => {
  it("validates each element and bounds", () => {
    const schema = v.array(v.string(), { min: 1, max: 2 });
    expect(schema.parse(["a"])).toEqual({ ok: true, value: ["a"] });
    expect(schema.parse([]).ok).toBe(false);
    expect(schema.parse(["a", "b", "c"]).ok).toBe(false);
    expect(schema.parse(["a", 2]).ok).toBe(false);
  });
});

describe("v.custom / v.nullable", () => {
  it("passes values through a type guard untouched", () => {
    const sub = v.custom(
      (s): s is { endpoint: string } =>
        typeof s === "object" && s !== null && typeof (s as Record<string, unknown>).endpoint === "string",
      "invalid subscription"
    );
    const value = { endpoint: "https://push", keys: { p256dh: "x" } };
    const result = sub.parse(value);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe(value); // same reference, extra keys intact
    expect(sub.parse({}).ok).toBe(false);
  });

  it("nullable accepts null", () => {
    expect(v.nullable(v.string()).parse(null)).toEqual({ ok: true, value: null });
    expect(v.nullable(v.string()).parse("x").ok).toBe(true);
  });
});

describe("formatIssues", () => {
  it("renders path: message pairs", () => {
    expect(formatIssues([{ path: "a", message: "required" }, { path: "b", message: "expected string" }]))
      .toBe("a: required; b: expected string");
  });
});
