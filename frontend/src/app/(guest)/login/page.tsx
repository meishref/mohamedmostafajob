"use client";

import { FormField } from "@/components/common/form-field";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Separator } from "@/components/ui/separator";
import { useApiError } from "@/hooks/use-api-error";
import { useLogin } from "@/hooks/use-auth";
import { useLoginSchema, type LoginFormValues } from "@/lib/validations/auth.schema";
import { authService } from "@/services/auth.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useLogin();
  const { parseError } = useApiError();
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const loginSchema = useLoginSchema();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { remember: false },
  });

  const remember = watch("remember");

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) toast.error(decodeURIComponent(error));
  }, [searchParams]);

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login.mutateAsync(values);
      toast.success(t("signInSuccess"));
      router.push("/dashboard");
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
          <CardTitle>{t("signInTitle")}</CardTitle>
          <CardDescription>{t("signInDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField label={tCommon("email")} htmlFor="email" error={errors.email?.message} required>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder={t("emailPlaceholder")}
                aria-invalid={!!errors.email}
                {...register("email")}
              />
            </FormField>

            <FormField label={tCommon("password")} htmlFor="password" error={errors.password?.message} required>
              <PasswordInput
                id="password"
                placeholder={t("passwordPlaceholder")}
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
            </FormField>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Checkbox
                  id="remember"
                  checked={remember}
                  onCheckedChange={(checked) => setValue("remember", checked === true)}
                />
                <Label htmlFor="remember" className="text-sm font-normal">
                  {t("rememberMe")}
                </Label>
              </div>
              <Link
                href="/forgot-password"
                className="rounded-sm text-sm font-medium text-primary transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {t("forgotPassword")}
              </Link>
            </div>

            <Button type="submit" className="w-full" loading={login.isPending}>
              {login.isPending ? t("signingIn") : t("signIn")}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <Separator className="flex-1" />
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {tCommon("or")}
            </span>
            <Separator className="flex-1" />
          </div>

          <Button variant="outline" className="w-full" asChild>
            <a href={authService.getGoogleAuthUrl()}>{t("continueWithGoogle")}</a>
          </Button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t("noAccount")}{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              {t("register")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
