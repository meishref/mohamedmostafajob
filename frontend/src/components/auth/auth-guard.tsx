"use client";

import { LoadingSpinner } from "@/components/common/loading-spinner";
import { useCurrentUser } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const router = useRouter();
  const { data, isLoading, isError, isFetched } = useCurrentUser();

  useEffect(() => {
    if (isFetched && (isError || !data?.user)) {
      router.replace("/login");
    }
  }, [isFetched, isError, data, router]);

  if (isLoading || !isFetched) {
    return fallback ?? <FullScreenLoader />;
  }

  if (isError || !data?.user) {
    return fallback ?? <FullScreenLoader />;
  }

  return <>{children}</>;
}
