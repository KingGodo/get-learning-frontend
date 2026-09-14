import type { ZodType } from "zod";
import { ApiRequestError } from "@/lib/api";

export type FieldErrors = Record<string, string>;

export type ParseOk<T> = { ok: true; data: T };
export type ParseFail = { ok: false; fieldErrors: FieldErrors };
export type ParseResult<T> = ParseOk<T> | ParseFail;

export function parseForm<T>(
  schema: ZodType<T>,
  values: unknown,
): ParseResult<T> {
  const result = schema.safeParse(values);
  if (result.success) {
    return { ok: true, data: result.data };
  }

  const fieldErrors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path.length > 0 ? issue.path.join(".") : "_form";
    if (!fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }
  return { ok: false, fieldErrors };
}

export function fieldErrorsFromApi(err: unknown): FieldErrors {
  if (!(err instanceof ApiRequestError) || !err.errors?.length) {
    return {};
  }
  const fieldErrors: FieldErrors = {};
  for (const item of err.errors) {
    const key = item.field || "_form";
    if (!fieldErrors[key]) {
      fieldErrors[key] = item.message;
    }
  }
  return fieldErrors;
}

export function firstFieldError(fieldErrors: FieldErrors): string | null {
  const values = Object.values(fieldErrors);
  return values[0] ?? null;
}
