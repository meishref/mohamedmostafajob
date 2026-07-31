"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export function AuthLayout({ children, title, description }: AuthLayoutProps) {
  const t = useTranslations("common");

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4 sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(var(--primary)/0.12),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_hsl(var(--info)/0.08),_transparent_45%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.35)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.35)_1px,transparent_1px)] bg-size-[24px_24px] opacity-40"
      />

      <div className="relative z-10 mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground shadow-md">
          {t("appName").charAt(0)}
        </div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("appName")}</h1>
        {title && <p className="mt-2 text-lg font-medium text-foreground">{title}</p>}
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="relative z-10 w-full max-w-md animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
        {children}
      </div>
    </div>
  );
}
