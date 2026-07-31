"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { z } from "zod";

const USER_ROLES = ["admin", "employee", "user"] as const;

export function useCreateUserSchema() {
  const t = useTranslations("validation");
  return useMemo(
    () =>
      z
        .object({
          name: z.string().min(1, t("nameRequired")).max(255),
          email: z.string().min(1, t("emailRequired")).email(t("emailInvalid")),
          phone: z.string().max(20).optional().or(z.literal("")),
          password: z.string().min(8, t("passwordMin")),
          password_confirmation: z.string().min(1, t("confirmPasswordRequiredShort")),
          status: z.enum(["active", "inactive", "suspended"]),
          role: z.enum(USER_ROLES, { message: t("roleRequired") }),
        })
        .refine((data) => data.password === data.password_confirmation, {
          message: t("passwordsDoNotMatch"),
          path: ["password_confirmation"],
        }),
    [t],
  );
}

export function useUpdateUserSchema() {
  const t = useTranslations("validation");
  return useMemo(
    () =>
      z.object({
        name: z.string().min(1, t("nameRequired")).max(255),
        email: z.string().min(1, t("emailRequired")).email(t("emailInvalid")),
        phone: z.string().max(20).optional().or(z.literal("")),
        status: z.enum(["active", "inactive", "suspended"]),
        role: z.enum(USER_ROLES, { message: t("roleRequired") }),
      }),
    [t],
  );
}

export function useResetUserPasswordSchema() {
  const t = useTranslations("validation");
  return useMemo(
    () =>
      z
        .object({
          password: z.string().min(8, t("passwordMin")),
          password_confirmation: z.string().min(1, t("confirmPasswordRequiredShort")),
        })
        .refine((data) => data.password === data.password_confirmation, {
          message: t("passwordsDoNotMatch"),
          path: ["password_confirmation"],
        }),
    [t],
  );
}

export const createUserSchema = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  password: z.string(),
  password_confirmation: z.string(),
  status: z.enum(["active", "inactive", "suspended"]),
  role: z.enum(USER_ROLES),
});

export const updateUserSchema = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  status: z.enum(["active", "inactive", "suspended"]),
  role: z.enum(USER_ROLES),
});

export const resetUserPasswordSchema = z.object({
  password: z.string(),
  password_confirmation: z.string(),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;
export type ResetUserPasswordFormValues = z.infer<typeof resetUserPasswordSchema>;
