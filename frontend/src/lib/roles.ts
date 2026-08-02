export const ASSIGNABLE_ROLES = ["admin", "employee"] as const;

export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

/** Map legacy "user" role to employee for old records still in the DB. */
export function normalizeRole(role: string): string {
  return role === "user" ? "employee" : role;
}

/** Unique assignable roles in fixed order (admin, employee). */
export function filterAssignableRoles(roles: string[]): AssignableRole[] {
  const normalized = new Set(roles.map(normalizeRole));

  return ASSIGNABLE_ROLES.filter((role) => normalized.has(role));
}

export function isAssignableRole(role: string): role is AssignableRole {
  return (ASSIGNABLE_ROLES as readonly string[]).includes(normalizeRole(role));
}

const EMPLOYEE_PERMISSIONS = [
  "tasks.view-own",
  "tasks.update-status",
  "tasks.comment",
] as const;

export function userHasRole(
  roles: string[] | null | undefined,
  role: string,
): boolean {
  if (!roles?.length) return false;
  const target = normalizeRole(role);

  return roles.some((r) => normalizeRole(r) === target);
}

export function userIsAdmin(roles: string[] | null | undefined): boolean {
  return userHasRole(roles, "admin");
}

export function userIsEmployee(
  roles: string[] | null | undefined,
  permissions: string[] | null | undefined,
): boolean {
  if (userIsAdmin(roles)) return false;

  return (
    userHasRole(roles, "employee") ||
    EMPLOYEE_PERMISSIONS.some((permission) => permissions?.includes(permission))
  );
}
