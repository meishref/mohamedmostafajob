import { SettingsGuard } from "@/components/auth/settings-guard";
import type { ReactNode } from "react";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return <SettingsGuard>{children}</SettingsGuard>;
}
