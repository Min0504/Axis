import { describe, it, expect } from "vitest";
import {
  ApiError,
  BadRequestError,
  NotFoundError,
  RateLimitError,
  ServiceUnavailableError,
  UnauthorizedError,
  ValidationError,
  toHttpError
} from "@/lib/server/errors";

describe("ApiError hierarchy", () => {
  it("maps each subclass to its status and code", () => {
    expect(toHttpError(new BadRequestError("nope"))).toMatchObject({
      status: 400, code: "bad_request", message: "nope", expected: true
    });
    expect(toHttpError(new ValidationError())).toMatchObject({ status: 400, code: "validation_failed" });
    expect(toHttpError(new UnauthorizedError())).toMatchObject({ status: 401, code: "unauthorized" });
    expect(toHttpError(new NotFoundError())).toMatchObject({ status: 404, code: "not_found" });
    expect(toHttpError(new ServiceUnavailableError())).toMatchObject({ status: 503, code: "service_unavailable" });
  });

  it("preserves legacy per-route message strings verbatim", () => {
    const err = toHttpError(new UnauthorizedError("로그인이 필요합니다."));
    expect(err.message).toBe("로그인이 필요합니다.");
  });

  it("RateLimitError carries a Retry-After header", () => {
    const err = toHttpError(new RateLimitError("too many", 42));
    expect(err.status).toBe(429);
    expect(err.headers).toEqual({ "Retry-After": "42" });
  });

  it("clamps negative Retry-After to 0", () => {
    const err = toHttpError(new RateLimitError("too many", -5));
    expect(err.headers).toEqual({ "Retry-After": "0" });
  });

  it("exposes safe details but never the cause", () => {
    const err = new ValidationError("bad", {
      details: { issues: [{ path: "x", message: "required" }] },
      cause: new Error("secret internal state")
    });
    const mapped = toHttpError(err);
    expect(mapped.details).toEqual({ issues: [{ path: "x", message: "required" }] });
    expect(JSON.stringify(mapped)).not.toContain("secret internal state");
  });

  it("keeps instanceof working across the hierarchy", () => {
    const err = new NotFoundError();
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("NotFoundError");
  });
});

describe("toHttpError with unknown errors", () => {
  it("never leaks internal error messages to the client", () => {
    const mapped = toHttpError(new Error("pg: connection string exposed"));
    expect(mapped.status).toBe(500);
    expect(mapped.code).toBe("internal_error");
    expect(mapped.expected).toBe(false);
    expect(mapped.message).not.toContain("pg:");
  });

  it("handles non-Error throws (strings, objects)", () => {
    expect(toHttpError("boom")).toMatchObject({ status: 500, expected: false });
    expect(toHttpError({ weird: true })).toMatchObject({ status: 500, expected: false });
  });
});
