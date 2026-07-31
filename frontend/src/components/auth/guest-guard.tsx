"use client";

import { LoadingSpinner } from "@/components/common/loading-spinner";
import { useCurrentUser } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

interface GuestGuardProps {
  children: ReactNode;
}

export function GuestGuard({ children }: GuestGuardProps) {
  const router = useRouter();
  const { data, isLoading, isSuccess, isFetched } = useCurrentUser();

  useEffect(() => {
    if (isFetched && isSuccess && data?.user) {
      router.replace("/dashboard");
    }
  }, [isFetched, isSuccess, data, router]);

  if (isLoading || !isFetched) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isSuccess && data?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return <>{children}</>;
}
