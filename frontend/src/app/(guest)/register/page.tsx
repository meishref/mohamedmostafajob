"use client";

import { FormField } from "@/components/common/form-field";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useApiError } from "@/hooks/use-api-error";
import { useRegister } from "@/hooks/use-auth";
import { useRegisterSchema, type RegisterFormValues } from "@/lib/validations/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const registerMutation = useRegister();
  const { parseError } = useApiError();
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const registerSchema = useRegisterSchema();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await registerMutation.mutateAsync(values);
      toast.success(t("registerSuccess"));
      router.push("/login");
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
          <CardTitle>{t("registerTitle")}</CardTitle>
          <CardDescription>{t("registerDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField label={t("fullName")} htmlFor="name" error={errors.name?.message} required>
              <Input
                id="name"
                placeholder={t("fullNamePlaceholder")}
                autoComplete="name"
                aria-invalid={!!errors.name}
                {...register("name")}
              />
            </FormField>

            <FormField label={tCommon("email")} htmlFor="email" error={errors.email?.message} required>
              <Input
                id="email"
                type="email"
                placeholder={t("emailPlaceholder")}
                autoComplete="email"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
            </FormField>

            <FormField label={t("phoneOptional")} htmlFor="phone" error={errors.phone?.message}>
              <Input
                id="phone"
                type="tel"
                placeholder={t("phonePlaceholder")}
                autoComplete="tel"
                aria-invalid={!!errors.phone}
                {...register("phone")}
              />
            </FormField>

            <FormField
              label={tCommon("password")}
              htmlFor="password"
              error={errors.password?.message}
              hint={t("passwordHint")}
              required
            >
              <PasswordInput
                id="password"
                placeholder={t("createPasswordPlaceholder")}
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
                placeholder={t("confirmPasswordPlaceholder")}
                autoComplete="new-password"
                aria-invalid={!!errors.password_confirmation}
                {...register("password_confirmation")}
              />
            </FormField>

            <Button type="submit" className="w-full" loading={registerMutation.isPending}>
              {registerMutation.isPending ? t("creatingAccount") : t("createAccount")}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t("alreadyHaveAccount")}{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              {t("signIn")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
