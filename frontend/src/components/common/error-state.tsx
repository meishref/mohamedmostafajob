"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title,
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  const t = useTranslations("common");
  const resolvedTitle = title ?? t("somethingWentWrong");
  const resolvedMessage = message ?? t("failedToLoad");

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-xl border border-destructive/20 bg-destructive/5 py-16 text-center animate-in fade-in-0 duration-300",
        className,
      )}
      role="alert"
    >
      <div className="rounded-2xl bg-destructive/10 p-4 text-destructive">
        <AlertCircle className="h-8 w-8" aria-hidden="true" />
      </div>
      <div className="max-w-sm space-y-1">
        <p className="font-semibold tracking-tight">{resolvedTitle}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">{resolvedMessage}</p>
      </div>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          {t("tryAgain")}
        </Button>
      )}
    </div>
  );
}
