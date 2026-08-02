import { ApiError } from "@/lib/api/client";

export function getFieldError(
  errors: Record<string, string[]> | undefined,
  field: string,
): string | undefined {
  return errors?.[field]?.[0];
}

type ErrorMessages = {
  somethingWentWrong: string;
  unauthorized: string;
  forbidden: string;
  network: string;
  serverError: string;
  validationFailed: string;
  emailSendFailed: string;
};

export function getValidationErrors(error: unknown): Record<string, string[]> | undefined {
  if (error instanceof ApiError) {
    return error.errors;
  }

  return undefined;
}

export function getErrorMessage(
  error: unknown,
  messages: ErrorMessages,
): string {
  if (!(error instanceof ApiError)) {
    if (error instanceof Error && error.message) {
      return error.message;
    }

    return messages.somethingWentWrong;
  }

  const validationErrors = getValidationErrors(error);
  if (validationErrors) {
    const firstFieldError = Object.values(validationErrors).flat()[0];
    if (firstFieldError) {
      return firstFieldError;
    }
  }

  if (error.statusCode === 0) {
    return messages.network;
  }

  if (error.statusCode === 401) {
    return messages.unauthorized;
  }

  if (error.statusCode === 403) {
    return messages.forbidden;
  }

  if (error.statusCode === 422) {
    return error.message || messages.validationFailed;
  }

  if (error.statusCode === 503 && /email/i.test(error.message)) {
    return messages.emailSendFailed;
  }

  if (error.statusCode >= 500) {
    return messages.serverError;
  }

  if (error.message && !looksLikeInternalError(error.message)) {
    return error.message;
  }

  return messages.somethingWentWrong;
}

function looksLikeInternalError(message: string): boolean {
  return (
    /SQLSTATE|stack trace|RuntimeException|TypeError|Parse error|vendor\/|\.php on line/i.test(
      message,
    )
  );
}

export function getErrorTitle(error: unknown, messages: ErrorMessages): string {
  if (!(error instanceof ApiError)) {
    return messages.somethingWentWrong;
  }

  if (error.statusCode === 401) {
    return messages.unauthorized;
  }

  if (error.statusCode === 403) {
    return messages.forbidden;
  }

  if (error.statusCode === 0) {
    return messages.network;
  }

  if (error.statusCode >= 500) {
    return messages.serverError;
  }

  return messages.somethingWentWrong;
}
