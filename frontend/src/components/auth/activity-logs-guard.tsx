"use client";

import { LoadingSpinner } from "@/components/common/loading-spinner";
import { usePermissions } from "@/hooks/use-permissions";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

interface ActivityLogsGuardProps {
  children: ReactNode;
}

export function ActivityLogsGuard({ children }: ActivityLogsGuardProps) {
  const router = useRouter();
  const { canViewActivityLogs, user } = usePermissions();

  useEffect(() => {
    if (user && !canViewActivityLogs) {
      router.replace("/profile");
    }
  }, [user, canViewActivityLogs, router]);

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!canViewActivityLogs) return null;

  return <>{children}</>;
}
