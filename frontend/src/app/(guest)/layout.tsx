import { GuestGuard } from "@/components/auth/guest-guard";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import type { ReactNode } from "react";
import { Suspense } from "react";

export default function GuestLayout({ children }: { children: ReactNode }) {
  return (
    <GuestGuard>
      <AuthLayout>
        <Suspense
          fallback={
            <div className="flex min-h-[240px] items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          }
        >
          {children}
        </Suspense>
      </AuthLayout>
    </GuestGuard>
  );
}
