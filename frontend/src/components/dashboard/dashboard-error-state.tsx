"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

interface DashboardErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function DashboardErrorState({ message, onRetry }: DashboardErrorStateProps) {
  const t = useTranslations("dashboard");
  const tCommon = useTranslations("common");
  const resolvedMessage = message ?? t("loadFailed");

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed bg-card py-20 text-center">
      <div className="rounded-full bg-destructive/10 p-4 text-destructive">
        <AlertCircle className="h-8 w-8" />
      </div>
      <div>
        <p className="font-medium">{tCommon("somethingWentWrong")}</p>
        <p className="mt-1 text-sm text-muted-foreground">{resolvedMessage}</p>
      </div>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          {tCommon("tryAgain")}
        </Button>
      )}
    </div>
  );
}
