"use client";

import { useCurrentUser } from "@/hooks/use-auth";
import { userHasRole, userIsAdmin, userIsEmployee } from "@/lib/roles";

export function usePermissions() {
  const { data } = useCurrentUser();
  const user = data?.user;

  const hasRole = (role: string) => userHasRole(user?.roles, role);
  const hasPermission = (permission: string) =>
    user?.permissions?.includes(permission) ?? false;
  const isAdmin = userIsAdmin(user?.roles);

  const canViewOwnTasks = hasPermission("tasks.view-own") || isAdmin;
  const canUpdateTaskStatus = hasPermission("tasks.update-status") || isAdmin;
  const canCommentTasks = hasPermission("tasks.comment") || isAdmin;
  const canViewTasks =
    hasPermission("tasks.view") || hasPermission("tasks.view-own") || isAdmin;

  const isEmployee = userIsEmployee(user?.roles, user?.permissions);

  return {
    user,
    hasRole,
    hasPermission,
    isAdmin,
    isEmployee,
    canViewUsers: hasPermission("users.view") || isAdmin,
    canCreateUsers: hasPermission("users.create") || isAdmin,
    canUpdateUsers: hasPermission("users.update") || isAdmin,
    canDeleteUsers: hasPermission("users.delete") || isAdmin,
    canSuspendUsers: hasPermission("users.suspend") || isAdmin,
    canResetPassword: hasPermission("users.reset-password") || isAdmin,
    canRestoreUsers: hasPermission("users.restore") || isAdmin,
    canViewSettings: hasPermission("settings.view") || isAdmin,
    canManageSettings: hasPermission("settings.manage") || isAdmin,
    canViewEmployees: hasPermission("employees.view") || isAdmin,
    canCreateEmployees: hasPermission("employees.create") || isAdmin,
    canUpdateEmployees: hasPermission("employees.update") || isAdmin,
    canDeleteEmployees: hasPermission("employees.delete") || isAdmin,
    canRestoreEmployees: hasPermission("employees.restore") || isAdmin,
    canViewTasks,
    canViewOwnTasks,
    canCreateTasks: hasPermission("tasks.create") || isAdmin,
    canUpdateTasks: hasPermission("tasks.update") || isAdmin,
    canUpdateTaskStatus,
    canCommentTasks,
    canDeleteTasks: hasPermission("tasks.delete") || isAdmin,
    canRestoreTasks: hasPermission("tasks.restore") || isAdmin,
    canViewExpenses: hasPermission("expenses.view") || isAdmin,
    canCreateExpenses: hasPermission("expenses.create") || isAdmin,
    canUpdateExpenses: hasPermission("expenses.update") || isAdmin,
    canDeleteExpenses: hasPermission("expenses.delete") || isAdmin,
    canRestoreExpenses: hasPermission("expenses.restore") || isAdmin,
    canViewPayments: hasPermission("payments.view") || isAdmin,
    canCreatePayments: hasPermission("payments.create") || isAdmin,
    canUpdatePayments: hasPermission("payments.update") || isAdmin,
    canDeletePayments: hasPermission("payments.delete") || isAdmin,
    canRestorePayments: hasPermission("payments.restore") || isAdmin,
    canViewActivityLogs: hasPermission("activity-logs.view") || isAdmin,
  };
}
