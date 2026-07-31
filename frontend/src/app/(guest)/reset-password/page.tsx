"use client";

import { FormField } from "@/components/common/form-field";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useApiError } from "@/hooks/use-api-error";
import { useResetPassword } from "@/hooks/use-auth";
import { useResetPasswordSchema, type ResetPasswordFormValues } from "@/lib/validations/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetPassword = useResetPassword();
  const { parseError } = useApiError();
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const resetPasswordSchema = useResetPasswordSchema();

  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, email },
  });

  useEffect(() => {
    if (token) setValue("token", token);
    if (email) setValue("email", email);
  }, [token, email, setValue]);

  const onSubmit = async (values: ResetPasswordFormValues) => {
    try {
      const message = await resetPassword.mutateAsync(values);
      toast.success(message);
      router.push("/login");
    } catch (error) {
      const parsed = parseError(error);
      toast.error(parsed.message);
    }
  };

  if (!token || !email) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <LanguageSwitcher />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{t("invalidResetLinkTitle")}</CardTitle>
            <CardDescription>{t("invalidResetLinkDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/forgot-password" className="text-sm text-primary hover:underline">
              {t("requestNewResetLink")}
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <LanguageSwitcher />
      </div>
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>{t("resetPasswordTitle")}</CardTitle>
          <CardDescription>{t("resetPasswordDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <input type="hidden" {...register("token")} />
            <FormField label={tCommon("email")} htmlFor="email" error={errors.email?.message}>
              <Input id="email" type="email" readOnly {...register("email")} />
            </FormField>

            <FormField
              label={t("newPassword")}
              htmlFor="password"
              error={errors.password?.message}
              hint={t("passwordHint")}
              required
            >
              <PasswordInput
                id="password"
                placeholder={t("newPasswordPlaceholder")}
                autoComplete="new-password"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
            </FormField>

            <FormField
              label={tCommon("confirmPassword")}
              htmlFor="password_confirmation"
              error={errors.password_confirmation?.message}
              required
            >
              <PasswordInput
                id="password_confirmation"
                placeholder={t("confirmNewPasswordPlaceholder")}
                autoComplete="new-password"
                aria-invalid={!!errors.password_confirmation}
                {...register("password_confirmation")}
              />
            </FormField>

            <Button type="submit" className="w-full" loading={resetPassword.isPending}>
              {resetPassword.isPending ? t("resetting") : t("resetPassword")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
