"use client";

import { LoadingSpinner } from "@/components/common/loading-spinner";
import { usePermissions } from "@/hooks/use-permissions";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

interface EmployeesGuardProps {
  children: ReactNode;
}

export function EmployeesGuard({ children }: EmployeesGuardProps) {
  const router = useRouter();
  const { canViewEmployees, user } = usePermissions();

  useEffect(() => {
    if (user && !canViewEmployees) {
      router.replace("/profile");
    }
  }, [user, canViewEmployees, router]);

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!canViewEmployees) return null;

  return <>{children}</>;
}
