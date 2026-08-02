"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { DashboardHeader } from "@/components/layouts/dashboard-header";
import { DashboardShell } from "@/components/layouts/dashboard-shell";
import { DashboardSidebar } from "@/components/layouts/dashboard-sidebar";
import type { ReactNode } from "react";
import { Suspense } from "react";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <DashboardShell
        sidebar={<DashboardSidebar />}
        header={<DashboardHeader />}
      >
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          }
        >
          {children}
        </Suspense>
      </DashboardShell>
    </AuthGuard>
  );
}
