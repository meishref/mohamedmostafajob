"use client";

import { settingsService } from "@/services/settings.service";
import type { LookupListParams, SettingsResourceSlug } from "@/types/settings";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const settingsKeys = {
  all: ["settings"] as const,
  resources: () => [...settingsKeys.all, "resources"] as const,
  lists: () => [...settingsKeys.all, "list"] as const,
  list: (resource: SettingsResourceSlug, params: LookupListParams) =>
    [...settingsKeys.lists(), resource, params] as const,
  details: () => [...settingsKeys.all, "detail"] as const,
  detail: (resource: SettingsResourceSlug, id: string) =>
    [...settingsKeys.details(), resource, id] as const,
  options: (resource: SettingsResourceSlug) =>
    [...settingsKeys.all, "options", resource] as const,
};

export function useSettingsResources() {
  return useQuery({
    queryKey: settingsKeys.resources(),
    queryFn: () => settingsService.getResources(),
  });
}

export function useLookupList(resource: SettingsResourceSlug, params: LookupListParams = {}) {
  return useQuery({
    queryKey: settingsKeys.list(resource, params),
    queryFn: () => settingsService.list(resource, params),
    placeholderData: (prev) => prev,
  });
}

export function useLookupItem(resource: SettingsResourceSlug, id: string, enabled = true) {
  return useQuery({
    queryKey: settingsKeys.detail(resource, id),
    queryFn: () => settingsService.get(resource, id),
    enabled: enabled && id.length > 0,
  });
}

export function useLookupOptions(resource: SettingsResourceSlug, enabled = true) {
  return useQuery({
    queryKey: settingsKeys.options(resource),
    queryFn: () => settingsService.getOptions(resource, { active_only: true }),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateLookup(resource: SettingsResourceSlug) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => settingsService.create(resource, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: settingsKeys.options(resource) });
    },
  });
}

export function useUpdateLookup(resource: SettingsResourceSlug, id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      settingsService.update(resource, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: settingsKeys.detail(resource, id) });
      queryClient.invalidateQueries({ queryKey: settingsKeys.options(resource) });
    },
  });
}

export function useDeleteLookup(resource: SettingsResourceSlug) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => settingsService.delete(resource, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: settingsKeys.options(resource) });
    },
  });
}

export function useRestoreLookup(resource: SettingsResourceSlug) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => settingsService.restore(resource, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: settingsKeys.options(resource) });
    },
  });
}
