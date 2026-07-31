"use client";

import { FormField } from "@/components/common/form-field";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useApiError } from "@/hooks/use-api-error";
import { useForgotPassword } from "@/hooks/use-auth";
import { useForgotPasswordSchema, type ForgotPasswordFormValues } from "@/lib/validations/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const forgotPassword = useForgotPassword();
  const { parseError } = useApiError();
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const forgotPasswordSchema = useForgotPasswordSchema();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      const message = await forgotPassword.mutateAsync(values);
      setSent(true);
      toast.success(message);
    } catch (error) {
      const parsed = parseError(error);
      toast.error(parsed.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <LanguageSwitcher />
      </div>
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>{t("forgotPasswordTitle")}</CardTitle>
          <CardDescription>{t("forgotPasswordDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <Alert variant="success">
              <AlertDescription>{t("resetLinkSent")}</AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormField label={tCommon("email")} htmlFor="email" error={errors.email?.message}>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  {...register("email")}
                />
              </FormField>

              <Button type="submit" className="w-full" loading={forgotPassword.isPending}>
                {forgotPassword.isPending ? t("sending") : t("sendResetLink")}
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link href="/login" className="text-primary hover:underline">
              {t("backToSignIn")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
