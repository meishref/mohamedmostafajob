"use client";

import { Badge } from "@/components/ui/badge";
import { filterAssignableRoles, normalizeRole } from "@/lib/roles";
import { useRoleLabel } from "@/hooks/use-role-label";

interface RoleBadgesProps {
  roles?: string[] | null;
  className?: string;
}

export function RoleBadges({ roles, className }: RoleBadgesProps) {
  const roleLabel = useRoleLabel();
  const visible = filterAssignableRoles(roles ?? []);

  if (visible.length === 0) {
    return null;
  }

  return (
    <>
      {visible.map((role) => (
        <Badge key={role} variant="outline" className={className}>
          {roleLabel(normalizeRole(role))}
        </Badge>
      ))}
    </>
  );
}
