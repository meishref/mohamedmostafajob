"use client";

import { LoadingSpinner } from "@/components/common/loading-spinner";
import { usePermissions } from "@/hooks/use-permissions";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

interface TasksGuardProps {
  children: ReactNode;
}

export function TasksGuard({ children }: TasksGuardProps) {
  const router = useRouter();
  const { canViewTasks, user } = usePermissions();

  useEffect(() => {
    if (user && !canViewTasks) {
      router.replace("/profile");
    }
  }, [user, canViewTasks, router]);

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!canViewTasks) return null;

  return <>{children}</>;
}
