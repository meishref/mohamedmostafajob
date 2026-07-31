import { GuestGuard } from "@/components/auth/guest-guard";
import { AuthLayout } from "@/components/layouts/auth-layout";
import type { ReactNode } from "react";

export default function GuestLayout({ children }: { children: ReactNode }) {
  return (
    <GuestGuard>
      <AuthLayout>{children}</AuthLayout>
    </GuestGuard>
  );
}
