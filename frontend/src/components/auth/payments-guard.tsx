"use client";

import { LoadingSpinner } from "@/components/common/loading-spinner";
import { usePermissions } from "@/hooks/use-permissions";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

export function PaymentsGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { canViewPayments, user } = usePermissions();

  useEffect(() => {
    if (user && !canViewPayments) router.replace("/profile");
  }, [user, canViewPayments, router]);

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!canViewPayments) return null;

  return <>{children}</>;
}
