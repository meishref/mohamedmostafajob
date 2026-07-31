import { TasksGuard } from "@/components/auth/tasks-guard";
import type { ReactNode } from "react";

export default function TasksLayout({ children }: { children: ReactNode }) {
  return <TasksGuard>{children}</TasksGuard>;
}
