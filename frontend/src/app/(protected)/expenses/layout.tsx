import { ExpensesGuard } from "@/components/auth/expenses-guard";
import type { ReactNode } from "react";

export default function ExpensesLayout({ children }: { children: ReactNode }) {
  return <ExpensesGuard>{children}</ExpensesGuard>;
}
