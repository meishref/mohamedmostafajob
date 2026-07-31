"use client";

import { LoadingSpinner } from "@/components/common/loading-spinner";
import { usePermissions } from "@/hooks/use-permissions";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

interface SettingsGuardProps {
  children: ReactNode;
  requireManage?: boolean;
}

export function SettingsGuard({ children, requireManage = false }: SettingsGuardProps) {
  const router = useRouter();
  const { canViewSettings, canManageSettings, user } = usePermissions();

  const allowed = requireManage ? canManageSettings : canViewSettings;

  useEffect(() => {
    if (user && !allowed) {
      router.replace("/profile");
    }
  }, [user, allowed, router]);

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!allowed) return null;

  return <>{children}</>;
}
