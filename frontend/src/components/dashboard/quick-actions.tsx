"use client";

import { Button } from "@/components/ui/button";
import { usePermissions } from "@/hooks/use-permissions";
import {
  ClipboardList,
  Receipt,
  Settings,
  UserCircle,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

const actions = [
  {
    labelKey: "addEmployee" as const,
    href: "/employees/new",
    icon: UserCircle,
    permission: "canCreateEmployees" as const,
  },
  {
    labelKey: "createTask" as const,
    href: "/tasks/new",
    icon: ClipboardList,
    permission: "canCreateTasks" as const,
  },
  {
    labelKey: "createExpense" as const,
    href: "/expenses/new",
    icon: Receipt,
    permission: "canCreateExpenses" as const,
  },
  {
    labelKey: "manageUsers" as const,
    href: "/users",
    icon: Users,
    permission: "canViewUsers" as const,
  },
  {
    labelKey: "adminSettings" as const,
    href: "/settings/departments",
    icon: Settings,
    permission: "canViewSettings" as const,
  },
];

export function QuickActions() {
  const t = useTranslations("dashboard.quickActions");
  const permissions = usePermissions();
  const visible = actions.filter((action) => permissions[action.permission]);

  if (visible.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {visible.map(({ labelKey, href, icon: Icon }) => (
        <Button key={href} variant="outline" size="sm" asChild>
          <Link href={href}>
            <Icon className="mr-2 h-4 w-4" />
            {t(labelKey)}
          </Link>
        </Button>
      ))}
    </div>
  );
}
