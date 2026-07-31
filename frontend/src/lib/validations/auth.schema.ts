"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { z } from "zod";

export function useLoginSchema() {
  const t = useTranslations("validation");
  return useMemo(
    () =>
      z.object({
        email: z.string().min(1, t("emailRequired")).email(t("emailInvalid")),
        password: z.string().min(8, t("passwordMin")),
        remember: z.boolean().optional(),
      }),
    [t],
  );
}

export function useRegisterSchema() {
  const t = useTranslations("validation");
  return useMemo(
    () =>
      z
        .object({
          name: z.string().min(1, t("nameRequired")).max(255),
          email: z.string().min(1, t("emailRequired")).email(t("emailInvalid")),
          phone: z.string().max(20).optional().or(z.literal("")),
          password: z.string().min(8, t("passwordMin")),
          password_confirmation: z.string().min(1, t("confirmPasswordRequired")),
        })
        .refine((data) => data.password === data.password_confirmation, {
          message: t("passwordsDoNotMatch"),
          path: ["password_confirmation"],
        }),
    [t],
  );
}

export function useForgotPasswordSchema() {
  const t = useTranslations("validation");
  return useMemo(
    () =>
      z.object({
        email: z.string().min(1, t("emailRequired")).email(t("emailInvalid")),
      }),
    [t],
  );
}

export function useResetPasswordSchema() {
  const t = useTranslations("validation");
  return useMemo(
    () =>
      z
        .object({
          email: z.string().min(1, t("emailRequired")).email(t("emailInvalid")),
          password: z.string().min(8, t("passwordMin")),
          password_confirmation: z.string().min(1, t("confirmPasswordRequired")),
          token: z.string().min(1),
        })
        .refine((data) => data.password === data.password_confirmation, {
          message: t("passwordsDoNotMatch"),
          path: ["password_confirmation"],
        }),
    [t],
  );
}

export function useUpdateProfileSchema() {
  const t = useTranslations("validation");
  return useMemo(
    () =>
      z.object({
        name: z.string().min(1, t("nameRequired")).max(255),
        phone: z.string().max(20).optional().or(z.literal("")),
      }),
    [t],
  );
}

export function useUpdateAccountSettingsSchema() {
  const t = useTranslations("validation");
  return useMemo(
    () =>
      z
        .object({
          email: z.string().min(1, t("emailRequired")).email(t("emailInvalid")),
          current_password: z.string().optional(),
          password: z.string().optional(),
          password_confirmation: z.string().optional(),
        })
        .refine(
          (data) => {
            if (data.password && data.password.length > 0) {
              return data.password.length >= 8;
            }
            return true;
          },
          { message: t("passwordMin"), path: ["password"] },
        )
        .refine(
          (data) => {
            if (data.password && data.password.length > 0) {
              return !!data.current_password;
            }
            return true;
          },
          { message: t("currentPasswordRequired"), path: ["current_password"] },
        )
        .refine(
          (data) => {
            if (data.password && data.password.length > 0) {
              return data.password === data.password_confirmation;
            }
            return true;
          },
          { message: t("passwordsDoNotMatch"), path: ["password_confirmation"] },
        ),
    [t],
  );
}

// Keep static schemas for type inference where hooks aren't used yet
export const loginSchema = z.object({
  email: z.string(),
  password: z.string(),
  remember: z.boolean().optional(),
});

export const registerSchema = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  password: z.string(),
  password_confirmation: z.string(),
});

export const forgotPasswordSchema = z.object({
  email: z.string(),
});

export const resetPasswordSchema = z.object({
  email: z.string(),
  password: z.string(),
  password_confirmation: z.string(),
  token: z.string(),
});

export const updateProfileSchema = z.object({
  name: z.string(),
  phone: z.string().optional(),
});

export const updateAccountSettingsSchema = z.object({
  email: z.string(),
  current_password: z.string().optional(),
  password: z.string().optional(),
  password_confirmation: z.string().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;
export type UpdateAccountSettingsFormValues = z.infer<typeof updateAccountSettingsSchema>;
