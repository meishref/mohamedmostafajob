"use client";

import { MobileNav } from "@/components/layouts/mobile-nav";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { GlobalSearch } from "@/components/search/global-search";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { Button } from "@/components/ui/button";
import { useCurrentUser, useLogout } from "@/hooks/use-auth";
import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function DashboardHeader() {
  const router = useRouter();
  const { data } = useCurrentUser();
  const logout = useLogout();
  const t = useTranslations("common");

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      toast.success(t("loggedOut"));
      router.replace("/login");
    } catch {
      toast.error(t("logoutFailed"));
    }
  };

  return (
    <div className="flex h-16 items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
      <MobileNav />
      <div className="hidden min-w-0 shrink-0 md:block">
        <p className="truncate text-sm font-semibold tracking-tight">{data?.user.name}</p>
        <p className="truncate text-xs text-muted-foreground">{data?.user.email}</p>
      </div>
      <GlobalSearch />
      <div className="ms-auto flex items-center gap-1.5 sm:gap-2">
        <LanguageSwitcher />
        <NotificationBell />
        <ThemeToggle />
        <Button
          variant="outline"
          size="sm"
          className="hidden sm:inline-flex"
          onClick={handleLogout}
          loading={logout.isPending}
        >
          <LogOut className="h-4 w-4" />
          {t("logout")}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="sm:hidden"
          onClick={handleLogout}
          loading={logout.isPending}
          aria-label={t("logout")}
        >
          {!logout.isPending && <LogOut className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
