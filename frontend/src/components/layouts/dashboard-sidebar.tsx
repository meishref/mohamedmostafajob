"use client";

import { cn } from "@/lib/utils";
import { getAllSettingsNavItems } from "@/config/settings";
import { usePermissions } from "@/hooks/use-permissions";
import {
  Briefcase,
  Building2,
  CircleDollarSign,
  ClipboardList,
  CreditCard,
  History,
  LayoutDashboard,
  Layers,
  ListChecks,
  Megaphone,
  Bell,
  Receipt,
  Settings,
  ShieldCheck,
  Tags,
  TrendingUp,
  User,
  UserCircle,
  Users,
  Wallet,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";

const accountNav = [
  { href: "/profile", labelKey: "profile" as const, icon: User },
  { href: "/notifications", labelKey: "notifications" as const, icon: Bell },
  { href: "/account-settings", labelKey: "accountSettings" as const, icon: Settings },
  { href: "/verify-email", labelKey: "verifyEmail" as const, icon: ShieldCheck },
];

const adminNav = [
  { href: "/dashboard", labelKey: "dashboard" as const, icon: LayoutDashboard, permission: null },
  { href: "/users", labelKey: "users" as const, icon: Users, permission: "canViewUsers" as const },
  { href: "/employees", labelKey: "employees" as const, icon: UserCircle, permission: "canViewEmployees" as const },
  { href: "/tasks", labelKey: "tasks" as const, icon: ClipboardList, permission: "canViewTasks" as const },
  { href: "/expenses", labelKey: "expenses" as const, icon: Receipt, permission: "canViewExpenses" as const },
  { href: "/payments", labelKey: "payments" as const, icon: CreditCard, permission: "canViewPayments" as const },
  { href: "/activity-logs", labelKey: "activityLog" as const, icon: History, permission: "canViewActivityLogs" as const },
];

const settingsIcons: Record<string, typeof Building2> = {
  departments: Building2,
  "job-titles": Briefcase,
  "employee-statuses": User,
  "task-statuses": ListChecks,
  priorities: Layers,
  "payment-types": CreditCard,
  "payment-statuses": Wallet,
  "expense-categories": Tags,
  "advertising-platforms": Megaphone,
  "exchange-rates": TrendingUp,
};

const settingsLabelKeys: Record<string, string> = {
  departments: "departments",
  "job-titles": "jobTitles",
  "employee-statuses": "employeeStatuses",
  "task-statuses": "taskStatuses",
  priorities: "priorities",
  "payment-types": "paymentTypes",
  "payment-statuses": "paymentStatuses",
  "expense-categories": "expenseCategories",
  "advertising-platforms": "advertisingPlatforms",
  "exchange-rates": "exchangeRates",
};

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: typeof User;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
        "hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground",
      )}
      aria-current={active ? "page" : undefined}
    >
      <Icon
        className={cn(
          "h-4 w-4 shrink-0 transition-colors",
          active ? "text-primary" : "text-muted-foreground group-hover:text-accent-foreground",
        )}
        aria-hidden="true"
      />
      <span className="truncate">{label}</span>
      {active && (
        <span className="ms-auto h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
      )}
    </Link>
  );
}

export function DashboardSidebar({ onNavigate }: { onNavigate?: () => void } = {}) {
  const pathname = usePathname();
  const permissions = usePermissions();
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const settingsNav = getAllSettingsNavItems().map((item) => ({
    ...item,
    href: `/settings/${item.slug}`,
    icon: settingsIcons[item.slug] ?? CircleDollarSign,
    labelKey: settingsLabelKeys[item.slug] ?? item.slug,
  }));

  return (
    <nav className="flex flex-col gap-6 p-4" aria-label={tCommon("navigation")}>
      <div className="px-3">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-sm">
            {tCommon("appName").charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight">{tCommon("appName")}</p>
            <p className="text-xs text-muted-foreground">{tCommon("adminConsole")}</p>
          </div>
        </Link>
      </div>

      <div>
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {tNav("account")}
        </p>
        <div className="flex flex-col gap-0.5">
          {accountNav.map(({ href, labelKey, icon }) => (
            <NavLink
              key={href}
              href={href}
              label={tNav(labelKey)}
              icon={icon}
              active={isActive(href)}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {tNav("management")}
        </p>
        <div className="flex flex-col gap-0.5">
          {adminNav
            .filter((item) => !item.permission || permissions[item.permission])
            .map(({ href, labelKey, icon }) => (
              <NavLink
                key={href}
                href={href}
                label={tNav(labelKey)}
                icon={icon}
                active={isActive(href)}
                onNavigate={onNavigate}
              />
            ))}
        </div>
      </div>

      {permissions.canViewSettings && (
        <div className="pb-4">
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {tNav("adminSettings")}
          </p>
          <div className="flex flex-col gap-0.5">
            {settingsNav.map(({ href, labelKey, icon }) => (
              <NavLink
                key={href}
                href={href}
                label={tNav(labelKey as "departments")}
                icon={icon}
                active={isActive(href)}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
