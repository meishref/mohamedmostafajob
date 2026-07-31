import { PaymentsGuard } from "@/components/auth/payments-guard";
import type { ReactNode } from "react";

export default function PaymentsLayout({ children }: { children: ReactNode }) {
  return <PaymentsGuard>{children}</PaymentsGuard>;
}
