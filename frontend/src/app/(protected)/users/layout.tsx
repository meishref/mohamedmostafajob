import { AdminGuard } from "@/components/auth/admin-guard";
import type { ReactNode } from "react";

export default function UsersLayout({ children }: { children: ReactNode }) {
  return <AdminGuard>{children}</AdminGuard>;
}
