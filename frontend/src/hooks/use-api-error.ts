"use client";

import { getErrorMessage, getValidationErrors } from "@/lib/api/errors";
import { ApiError } from "@/lib/api/client";

export function useApiError() {
  const parseError = (error: unknown) => ({
    message: getErrorMessage(error),
    errors: getValidationErrors(error),
    statusCode: error instanceof ApiError ? error.statusCode : undefined,
  });

  return { parseError };
}
