"use client";

import { LoadingSpinner } from "@/components/common/loading-spinner";
import { usePermissions } from "@/hooks/use-permissions";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

interface ExpensesGuardProps {
  children: ReactNode;
}

export function ExpensesGuard({ children }: ExpensesGuardProps) {
  const router = useRouter();
  const { canViewExpenses, user } = usePermissions();

  useEffect(() => {
    if (user && !canViewExpenses) {
      router.replace("/profile");
    }
  }, [user, canViewExpenses, router]);

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!canViewExpenses) return null;

  return <>{children}</>;
}
