"use client";

import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

interface NotFoundStateProps {
  title?: string;
  message?: string;
  backHref?: string;
  backLabel?: string;
}

export function NotFoundState({
  title,
  message,
  backHref,
  backLabel,
}: NotFoundStateProps) {
  const t = useTranslations("errors");
  const resolvedTitle = title ?? t("notFoundTitle");
  const resolvedMessage = message ?? t("notFoundMessage");
  const resolvedBackLabel = backLabel ?? t("goBack");

  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="rounded-full bg-muted p-4 text-muted-foreground">
        <FileQuestion className="h-8 w-8" />
      </div>
      <div>
        <p className="font-medium">{resolvedTitle}</p>
        <p className="mt-1 text-sm text-muted-foreground">{resolvedMessage}</p>
      </div>
      {backHref && (
        <Button variant="outline" asChild>
          <Link href={backHref}>{resolvedBackLabel}</Link>
        </Button>
      )}
    </div>
  );
}
