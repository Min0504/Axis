import { afterEach, describe, expect, it } from "vitest";
import { isAdminRequest } from "@/lib/admin-auth";

describe("isAdminRequest", () => {
  const prev = {
    AXIS_ADMIN: process.env.AXIS_ADMIN,
    AXIS_ADMIN_TOKEN: process.env.AXIS_ADMIN_TOKEN,
    VERCEL_ENV: process.env.VERCEL_ENV
  };

  afterEach(() => {
    process.env.AXIS_ADMIN = prev.AXIS_ADMIN;
    process.env.AXIS_ADMIN_TOKEN = prev.AXIS_ADMIN_TOKEN;
    process.env.VERCEL_ENV = prev.VERCEL_ENV;
  });

  it("rejects when AXIS_ADMIN is off", () => {
    process.env.AXIS_ADMIN = "0";
    delete process.env.AXIS_ADMIN_TOKEN;
    delete process.env.VERCEL_ENV;
    expect(isAdminRequest(new Request("http://x"))).toBe(false);
  });

  it("allows local admin without token when not production", () => {
    process.env.AXIS_ADMIN = "1";
    delete process.env.AXIS_ADMIN_TOKEN;
    delete process.env.VERCEL_ENV;
    expect(isAdminRequest(new Request("http://x"))).toBe(true);
  });

  it("requires bearer token in production", () => {
    process.env.AXIS_ADMIN = "1";
    process.env.AXIS_ADMIN_TOKEN = "secret-token";
    process.env.VERCEL_ENV = "production";

    expect(isAdminRequest(new Request("http://x"))).toBe(false);
    expect(
      isAdminRequest(
        new Request("http://x", { headers: { authorization: "Bearer wrong" } })
      )
    ).toBe(false);
    expect(
      isAdminRequest(
        new Request("http://x", { headers: { authorization: "Bearer secret-token" } })
      )
    ).toBe(true);
  });
});
