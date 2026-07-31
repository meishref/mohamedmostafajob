import { ActivityLogsGuard } from "@/components/auth/activity-logs-guard";
import type { ReactNode } from "react";

export default function ActivityLogsLayout({ children }: { children: ReactNode }) {
  return <ActivityLogsGuard>{children}</ActivityLogsGuard>;
}
