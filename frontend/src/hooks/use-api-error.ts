"use client";

import { getErrorMessage, getErrorTitle, getValidationErrors } from "@/lib/api/errors";
import { ApiError } from "@/lib/api/client";
import { useTranslations } from "next-intl";

export function useApiError() {
  const t = useTranslations("errors");

  const messages = {
    somethingWentWrong: t("somethingWentWrong"),
    unauthorized: t("sessionExpired"),
    forbidden: t("forbidden"),
    network: t("network"),
    serverError: t("serverError"),
    validationFailed: t("validationFailed"),
    emailSendFailed: t("emailSendFailed"),
  };

  const parseError = (error: unknown) => ({
    message: getErrorMessage(error, messages),
    title: getErrorTitle(error, messages),
    errors: getValidationErrors(error),
    statusCode: error instanceof ApiError ? error.statusCode : undefined,
  });

  return { parseError };
}
