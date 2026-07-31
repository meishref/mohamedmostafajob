"use client";

import { searchService } from "@/services/search.service";
import { useQuery } from "@tanstack/react-query";

export const searchKeys = {
  all: ["search"] as const,
  query: (q: string) => [...searchKeys.all, q] as const,
};

export function useGlobalSearch(query: string, enabled = true) {
  return useQuery({
    queryKey: searchKeys.query(query),
    queryFn: () => searchService.search(query),
    enabled: enabled && query.trim().length >= 2,
    staleTime: 30_000,
  });
}
