/**
 * Zero-dependency declarative schema validation (zod-style, minimal).
 *
 * Why hand-rolled instead of zod: the API surface we need is tiny (objects,
 * strings, numbers, enums, arrays), and building it teaches exactly what a
 * validation library does under the hood — parse-don't-validate, typed
 * inference via generics, and issue collection with paths.
 *
 * Design rules:
 *  - parse() never throws; it returns a discriminated union result.
 *  - object() STRIPS unknown keys (mass-assignment protection by default).
 *  - Schemas are `Schema<T>` and `Infer<typeof schema>` recovers T, so the
 *    validated body/query types flow into handlers without casts.
 */

export type Issue = { path: string; message: string };

export type ParseResult<T> = { ok: true; value: T } | { ok: false; issues: Issue[] };

export interface Schema<T> {
  parse(input: unknown, path?: string): ParseResult<T>;
}

export type Infer<S> = S extends Schema<infer T> ? T : never;

function fail(path: string, message: string): ParseResult<never> {
  return { ok: false, issues: [{ path: path || "value", message }] };
}

function ok<T>(value: T): ParseResult<T> {
  return { ok: true, value };
}

type StringOptions = {
  /** Trim before all other checks. */
  trim?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  email?: boolean;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function string(opts: StringOptions = {}): Schema<string> {
  return {
    parse(input, path = "") {
      if (typeof input !== "string") return fail(path, "expected string");
      const value = opts.trim ? input.trim() : input;
      if (opts.min !== undefined && value.length < opts.min) {
        return fail(path, `must be at least ${opts.min} characters`);
      }
      if (opts.max !== undefined && value.length > opts.max) {
        return fail(path, `must be at most ${opts.max} characters`);
      }
      if (opts.pattern && !opts.pattern.test(value)) return fail(path, "invalid format");
      if (opts.email && !EMAIL_RE.test(value)) return fail(path, "invalid email");
      return ok(value);
    }
  };
}

type NumberOptions = { min?: number; max?: number; int?: boolean };

function number(opts: NumberOptions = {}): Schema<number> {
  return {
    parse(input, path = "") {
      if (typeof input !== "number" || Number.isNaN(input) || !Number.isFinite(input)) {
        return fail(path, "expected number");
      }
      if (opts.int && !Number.isInteger(input)) return fail(path, "expected integer");
      if (opts.min !== undefined && input < opts.min) return fail(path, `must be >= ${opts.min}`);
      if (opts.max !== undefined && input > opts.max) return fail(path, `must be <= ${opts.max}`);
      return ok(input);
    }
  };
}

function boolean(): Schema<boolean> {
  return {
    parse(input, path = "") {
      if (typeof input !== "boolean") return fail(path, "expected boolean");
      return ok(input);
    }
  };
}

function enumOf<const T extends readonly [string, ...string[]]>(values: T): Schema<T[number]> {
  return {
    parse(input, path = "") {
      if (typeof input === "string" && (values as readonly string[]).includes(input)) {
        return ok(input as T[number]);
      }
      return fail(path, `expected one of: ${values.join(", ")}`);
    }
  };
}

/**
 * Marker-carrying optional wrapper: object() uses the marker to allow the key
 * to be absent entirely, mirroring TypeScript's `field?: T` semantics.
 */
type OptionalSchema<T> = Schema<T | undefined> & { readonly __optional: true };

function optional<T>(inner: Schema<T>): OptionalSchema<T> {
  return {
    __optional: true,
    parse(input, path = "") {
      if (input === undefined) return ok(undefined);
      return inner.parse(input, path);
    }
  };
}

function nullable<T>(inner: Schema<T>): Schema<T | null> {
  return {
    parse(input, path = "") {
      if (input === null) return ok(null);
      return inner.parse(input, path);
    }
  };
}

type ArrayOptions = { min?: number; max?: number };

function array<T>(item: Schema<T>, opts: ArrayOptions = {}): Schema<T[]> {
  return {
    parse(input, path = "") {
      if (!Array.isArray(input)) return fail(path, "expected array");
      if (opts.min !== undefined && input.length < opts.min) {
        return fail(path, `must have at least ${opts.min} items`);
      }
      if (opts.max !== undefined && input.length > opts.max) {
        return fail(path, `must have at most ${opts.max} items`);
      }
      const out: T[] = [];
      const issues: Issue[] = [];
      input.forEach((element, i) => {
        const result = item.parse(element, path ? `${path}[${i}]` : `[${i}]`);
        if (result.ok) out.push(result.value);
        else issues.push(...result.issues);
      });
      return issues.length > 0 ? { ok: false, issues } : ok(out);
    }
  };
}

type ObjectShape = Record<string, Schema<unknown>>;

/** Keys whose schema carries the optional marker. */
type OptionalKeys<S extends ObjectShape> = {
  [K in keyof S]: S[K] extends { __optional: true } ? K : never;
}[keyof S];

type Flatten<T> = { [K in keyof T]: T[K] };

/** v.optional(...) keys become `key?: T` — mirroring TypeScript object types. */
type ObjectOutput<S extends ObjectShape> = Flatten<
  { [K in Exclude<keyof S, OptionalKeys<S>>]: Infer<S[K]> } & {
    [K in OptionalKeys<S>]?: Infer<S[K]>;
  }
>;

function object<S extends ObjectShape>(shape: S): Schema<ObjectOutput<S>> {
  return {
    parse(input, path = "") {
      if (typeof input !== "object" || input === null || Array.isArray(input)) {
        return fail(path, "expected object");
      }
      const record = input as Record<string, unknown>;
      const out: Record<string, unknown> = {};
      const issues: Issue[] = [];

      for (const [key, schema] of Object.entries(shape)) {
        const childPath = path ? `${path}.${key}` : key;
        const raw = record[key];

        if (raw === undefined && !(key in record)) {
          const isOptional = (schema as Partial<OptionalSchema<unknown>>).__optional === true;
          if (isOptional) continue;
          issues.push({ path: childPath, message: "required" });
          continue;
        }

        const result = schema.parse(raw, childPath);
        if (result.ok) {
          if (result.value !== undefined) out[key] = result.value;
        } else {
          issues.push(...result.issues);
        }
      }

      // Unknown keys are intentionally dropped (never forwarded to DB/services).
      return issues.length > 0
        ? { ok: false, issues }
        : ok(out as ObjectOutput<S>);
    }
  };
}

/**
 * Escape hatch for shapes we validate with a hand-written guard but must pass
 * through untouched (e.g. WebPush subscription objects whose extra keys the
 * push library needs).
 */
function custom<T>(guard: (input: unknown) => input is T, message = "invalid value"): Schema<T> {
  return {
    parse(input, path = "") {
      return guard(input) ? ok(input) : fail(path, message);
    }
  };
}

function unknown(): Schema<unknown> {
  return { parse: (input) => ok(input) };
}

export const v = {
  string,
  number,
  boolean,
  enum: enumOf,
  optional,
  nullable,
  array,
  object,
  custom,
  unknown
};

/** Render issues compactly for logs / error details. */
export function formatIssues(issues: Issue[]): string {
  return issues.map((i) => `${i.path}: ${i.message}`).join("; ");
}
