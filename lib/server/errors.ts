/**
 * Centralized API error model.
 *
 * Route handlers (and the pipeline in api-handler.ts) throw ApiError
 * subclasses instead of hand-building error JSON in every route. A single
 * mapper (toHttpError) turns any thrown value into a consistent HTTP shape:
 *
 *   { error: <human message>, code: <stable machine code>, requestId }
 *
 * `error` message strings are part of the existing public contract (the
 * frontend displays some of them verbatim), so callers pass legacy messages
 * through unchanged. `code` is the stable machine-readable field new clients
 * should branch on instead of parsing message text.
 *
 * This module is framework-free on purpose (no next/server import) so it can
 * be unit-tested and reused outside route handlers.
 */

export type ApiErrorCode =
  | "bad_request"
  | "validation_failed"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "rate_limited"
  | "service_unavailable"
  | "internal_error";

type ApiErrorOptions = {
  /** Safe-to-expose structured details (e.g. validation issues). Never put secrets here. */
  details?: unknown;
  /** Extra response headers (e.g. Retry-After). */
  headers?: Record<string, string>;
  /** Original error for logs. Never exposed to clients. */
  cause?: unknown;
};

export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly details?: unknown;
  readonly headers?: Record<string, string>;

  constructor(status: number, code: ApiErrorCode, message: string, opts: ApiErrorOptions = {}) {
    super(message, opts.cause !== undefined ? { cause: opts.cause } : undefined);
    this.name = new.target.name;
    this.status = status;
    this.code = code;
    this.details = opts.details;
    this.headers = opts.headers;
  }
}

export class BadRequestError extends ApiError {
  constructor(message = "bad request", opts?: ApiErrorOptions) {
    super(400, "bad_request", message, opts);
  }
}

export class ValidationError extends ApiError {
  constructor(message = "validation failed", opts?: ApiErrorOptions) {
    super(400, "validation_failed", message, opts);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "unauthorized", opts?: ApiErrorOptions) {
    super(401, "unauthorized", message, opts);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = "forbidden", opts?: ApiErrorOptions) {
    super(403, "forbidden", message, opts);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = "not found", opts?: ApiErrorOptions) {
    super(404, "not_found", message, opts);
  }
}

export class ConflictError extends ApiError {
  constructor(message = "conflict", opts?: ApiErrorOptions) {
    super(409, "conflict", message, opts);
  }
}

export class RateLimitError extends ApiError {
  constructor(message = "rate limited", retryAfterSec?: number, opts?: ApiErrorOptions) {
    super(429, "rate_limited", message, {
      ...opts,
      headers: {
        ...(retryAfterSec !== undefined ? { "Retry-After": String(Math.max(0, retryAfterSec)) } : {}),
        ...opts?.headers
      }
    });
  }
}

export class ServiceUnavailableError extends ApiError {
  constructor(message = "service unavailable", opts?: ApiErrorOptions) {
    super(503, "service_unavailable", message, opts);
  }
}

export class InternalError extends ApiError {
  constructor(message = "internal error", opts?: ApiErrorOptions) {
    super(500, "internal_error", message, opts);
  }
}

/** Wire shape of every error mapped by the pipeline. */
export type HttpErrorShape = {
  status: number;
  code: ApiErrorCode;
  message: string;
  details?: unknown;
  headers?: Record<string, string>;
  /** false = unexpected crash; log with stack and hide internals from the client. */
  expected: boolean;
};

const GENERIC_INTERNAL_MESSAGE = "서버 오류가 발생했습니다.";

/**
 * Map any thrown value to an HTTP error shape.
 * Unknown errors never leak their message to the client — only to logs.
 */
export function toHttpError(err: unknown): HttpErrorShape {
  if (err instanceof ApiError) {
    return {
      status: err.status,
      code: err.code,
      message: err.message,
      details: err.details,
      headers: err.headers,
      expected: true
    };
  }
  return {
    status: 500,
    code: "internal_error",
    message: GENERIC_INTERNAL_MESSAGE,
    expected: false
  };
}
