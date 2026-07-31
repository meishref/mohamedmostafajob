"use client";

import { LoadingSpinner } from "@/components/common/loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrentUser, useSendVerificationEmail, useVerifyEmail } from "@/hooks/use-auth";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const { data, isLoading, refetch } = useCurrentUser();
  const sendVerification = useSendVerificationEmail();
  const verifyEmail = useVerifyEmail();
  const [verified, setVerified] = useState(false);
  const t = useTranslations("auth");

  const redirectUrl = searchParams.get("redirect");

  useEffect(() => {
    if (redirectUrl) {
      verifyEmail.mutateAsync(decodeURIComponent(redirectUrl))
        .then(() => {
          setVerified(true);
          toast.success(t("verifySuccess"));
          refetch();
        })
        .catch(() => {
          toast.error(t("verifyFailed"));
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [redirectUrl]);

  const handleResend = async () => {
    try {
      const message = await sendVerification.mutateAsync();
      toast.success(message);
    } catch {
      toast.error(t("resendFailed"));
    }
  };

  if (isLoading || verifyEmail.isPending) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" label={t("verifyingEmail")} />
      </div>
    );
  }

  const user = data?.user;
  const isEmailVerified = !!user?.email_verified_at || verified;

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>{t("verifyEmailTitle")}</CardTitle>
        <CardDescription>{t("verifyEmailDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEmailVerified ? (
          <Alert variant="success">
            <AlertDescription>
              {t.rich("emailVerified", {
                email: user?.email ?? "",
                strong: (chunks) => <strong>{chunks}</strong>,
              })}
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <Alert>
              <AlertDescription>
                {t.rich("emailNotVerified", {
                  email: user?.email ?? "",
                  strong: (chunks) => <strong>{chunks}</strong>,
                })}
              </AlertDescription>
            </Alert>
            <Button
              onClick={handleResend}
              disabled={sendVerification.isPending}
            >
              {sendVerification.isPending ? t("sending") : t("resendVerification")}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
