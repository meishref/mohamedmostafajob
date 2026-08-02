"use client";

import { DashboardSidebar } from "@/components/layouts/dashboard-sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface MobileNavProps {
  className?: string;
}

export function MobileNav({ className }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const t = useTranslations("common");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const closeMenu = () => setOpen(false);

  const menu = open ? (
    <div className="fixed inset-0 z-[100] lg:hidden" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        aria-label={t("closeMenu")}
        onClick={closeMenu}
      />
      <aside
        className={cn(
          "absolute inset-y-0 start-0 z-10 flex w-[min(100vw-3rem,18rem)] flex-col",
          "border-border bg-card text-card-foreground shadow-xl",
          "border-e",
          "animate-in fade-in-0 duration-200 ltr:slide-in-from-left-full rtl:slide-in-from-right-full",
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
          <p className="text-sm font-semibold">{t("navigation")}</p>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeMenu}
            aria-label={t("closeMenu")}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <DashboardSidebar onNavigate={closeMenu} />
        </div>
      </aside>
    </div>
  ) : null;

  return (
    <div className={cn("lg:hidden", className)}>
      <Button
        variant="outline"
        size="icon"
        aria-label={t("openMenu")}
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Menu className="h-4 w-4" />
      </Button>

      {mounted && menu ? createPortal(menu, document.body) : null}
    </div>
  );
}
