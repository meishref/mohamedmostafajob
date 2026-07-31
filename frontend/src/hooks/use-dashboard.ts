"use client";

import { dashboardService } from "@/services/dashboard.service";
import { useCurrentUser } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  data: (userId?: string) => [...dashboardKeys.all, "data", userId ?? "anonymous"] as const,
};

export function useDashboard() {
  const { data: auth } = useCurrentUser();
  const userId = auth?.user?.id;

  return useQuery({
    queryKey: dashboardKeys.data(userId),
    queryFn: () => dashboardService.get(),
    enabled: Boolean(userId),
    staleTime: 30 * 1000,
  });
}
