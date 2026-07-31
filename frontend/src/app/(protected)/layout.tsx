"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { DashboardHeader } from "@/components/layouts/dashboard-header";
import { DashboardShell } from "@/components/layouts/dashboard-shell";
import { DashboardSidebar } from "@/components/layouts/dashboard-sidebar";
import type { ReactNode } from "react";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <DashboardShell
        sidebar={<DashboardSidebar />}
        header={<DashboardHeader />}
      >
        {children}
      </DashboardShell>
    </AuthGuard>
  );
}
