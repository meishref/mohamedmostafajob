export const ASSIGNABLE_ROLES = ["admin", "employee"] as const;

export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

/** Legacy "user" role is shown/treated as employee. */
export function normalizeRole(role: string): string {
  return role === "user" ? "employee" : role;
}

export function filterAssignableRoles(roles: string[]): AssignableRole[] {
  return roles
    .map(normalizeRole)
    .filter((role): role is AssignableRole =>
      (ASSIGNABLE_ROLES as readonly string[]).includes(role),
    );
}

export function isAssignableRole(role: string): role is AssignableRole {
  return (ASSIGNABLE_ROLES as readonly string[]).includes(normalizeRole(role));
}
