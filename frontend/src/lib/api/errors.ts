import { ApiError } from "@/lib/api/client";

export function getFieldError(
  errors: Record<string, string[]> | undefined,
  field: string,
): string | undefined {
  return errors?.[field]?.[0];
}

export function getErrorMessage(error: unknown, fallback = "Something went wrong."): string {
  if (error instanceof ApiError) {
    if (error.errors) {
      const firstFieldError = Object.values(error.errors).flat()[0];
      if (firstFieldError) {
        return firstFieldError;
      }
    }
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export function getValidationErrors(error: unknown): Record<string, string[]> | undefined {
  if (error instanceof ApiError) {
    return error.errors;
  }

  return undefined;
}
