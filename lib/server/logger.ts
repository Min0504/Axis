/**
 * Structured JSON logger.
 *
 * Why not console.log free-form strings: on Vercel (and any log aggregator)
 * one-JSON-object-per-line logs are filterable by field — e.g. all lines for
 * one requestId, all 5xx for one route, p95 durationMs. Free-form strings are
 * not.
 *
 * Usage:
 *   const log = createLogger({ requestId, route: "POST /api/watches" });
 *   log.info("request completed", { status: 200, durationMs: 12 });
 *   log.error("db insert failed", { err });
 *
 * `child()` creates a logger that inherits parent context — the standard way
 * to thread request-scoped fields through call trees without globals.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
};

export type LogContext = Record<string, unknown>;

export type Logger = {
  debug(msg: string, context?: LogContext): void;
  info(msg: string, context?: LogContext): void;
  warn(msg: string, context?: LogContext): void;
  error(msg: string, context?: LogContext): void;
  child(context: LogContext): Logger;
};

function activeLevel(): LogLevel {
  const raw = process.env.LOG_LEVEL?.toLowerCase();
  if (raw === "debug" || raw === "info" || raw === "warn" || raw === "error") return raw;
  return process.env.NODE_ENV === "production" ? "info" : "debug";
}

/** Errors don't JSON.stringify by default — flatten the useful parts. */
function serializeValue(value: unknown): unknown {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
      ...(value.cause !== undefined ? { cause: serializeValue(value.cause) } : {})
    };
  }
  return value;
}

function serializeContext(context: LogContext): LogContext {
  const out: LogContext = {};
  for (const [key, value] of Object.entries(context)) {
    out[key] = serializeValue(value);
  }
  return out;
}

function emit(level: LogLevel, msg: string, context: LogContext): void {
  if (LEVEL_WEIGHT[level] < LEVEL_WEIGHT[activeLevel()]) return;

  const line = {
    level,
    time: new Date().toISOString(),
    msg,
    ...serializeContext(context)
  };

  let serialized: string;
  try {
    serialized = JSON.stringify(line);
  } catch {
    // Circular structures etc. — logging must never throw.
    serialized = JSON.stringify({ level, time: line.time, msg, logError: "unserializable context" });
  }

  if (level === "error") console.error(serialized);
  else if (level === "warn") console.warn(serialized);
  else console.log(serialized);
}

export function createLogger(base: LogContext = {}): Logger {
  return {
    debug: (msg, context) => emit("debug", msg, { ...base, ...context }),
    info: (msg, context) => emit("info", msg, { ...base, ...context }),
    warn: (msg, context) => emit("warn", msg, { ...base, ...context }),
    error: (msg, context) => emit("error", msg, { ...base, ...context }),
    child: (context) => createLogger({ ...base, ...context })
  };
}

/** Process-wide logger for code that runs outside a request (startup, cron internals). */
export const rootLogger = createLogger();
