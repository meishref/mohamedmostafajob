import { EmployeesGuard } from "@/components/auth/employees-guard";
import type { ReactNode } from "react";

export default function EmployeesLayout({ children }: { children: ReactNode }) {
  return <EmployeesGuard>{children}</EmployeesGuard>;
}
