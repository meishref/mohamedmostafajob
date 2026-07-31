"use client";

import { FormField } from "@/components/common/form-field";
import { PageHeader } from "@/components/common/page-header";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Separator } from "@/components/ui/separator";
import { useApiError } from "@/hooks/use-api-error";
import { useCurrentUser, useUpdateAccountSettings } from "@/hooks/use-auth";
import {
  useUpdateAccountSettingsSchema,
  type UpdateAccountSettingsFormValues,
} from "@/lib/validations/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function AccountSettingsPage() {
  const { data, isLoading } = useCurrentUser();
  const updateSettings = useUpdateAccountSettings();
  const { parseError } = useApiError();
  const t = useTranslations("accountSettings");
  const updateAccountSettingsSchema = useUpdateAccountSettingsSchema();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateAccountSettingsFormValues>({
    resolver: zodResolver(updateAccountSettingsSchema),
  });

  useEffect(() => {
    if (data?.user) {
      reset({ email: data.user.email });
    }
  }, [data, reset]);

  const onSubmit = async (values: UpdateAccountSettingsFormValues) => {
    try {
      const payload: UpdateAccountSettingsFormValues = { email: values.email };
      if (values.password) {
        payload.current_password = values.current_password;
        payload.password = values.password;
        payload.password_confirmation = values.password_confirmation;
      }
      await updateSettings.mutateAsync(payload);
      toast.success(t("toast.updated"));
      reset({ email: values.email });
    } catch (error) {
      toast.error(parseError(error).message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title={t("title")}
        description={t("description")}
      />
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>{t("securityTitle")}</CardTitle>
          <CardDescription>{t("securityDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            <FormField label={t("email")} htmlFor="email" error={errors.email?.message} required>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
            </FormField>

            <Separator />

            <Alert variant="info">
              <Info className="h-4 w-4" />
              <AlertDescription>
                {t("passwordHint")}
              </AlertDescription>
            </Alert>

            <FormField
              label={t("currentPassword")}
              htmlFor="current_password"
              error={errors.current_password?.message}
            >
              <PasswordInput
                id="current_password"
                placeholder={t("currentPasswordPlaceholder")}
                autoComplete="current-password"
                aria-invalid={!!errors.current_password}
                {...register("current_password")}
              />
            </FormField>

            <FormField
              label={t("newPassword")}
              htmlFor="password"
              error={errors.password?.message}
              hint={t("passwordStrengthHint")}
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
              label={t("confirmNewPassword")}
              htmlFor="password_confirmation"
              error={errors.password_confirmation?.message}
            >
              <PasswordInput
                id="password_confirmation"
                placeholder={t("confirmNewPasswordPlaceholder")}
                autoComplete="new-password"
                aria-invalid={!!errors.password_confirmation}
                {...register("password_confirmation")}
              />
            </FormField>

            <Button type="submit" loading={updateSettings.isPending}>
              {updateSettings.isPending ? t("saving") : t("saveSettings")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
