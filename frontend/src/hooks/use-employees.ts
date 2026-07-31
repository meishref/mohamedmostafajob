"use client";

import { employeeService } from "@/services/employee.service";
import type {
  CreateEmployeeData,
  EmployeeListParams,
  UpdateEmployeeData,
} from "@/types/employees";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const employeeKeys = {
  all: ["employees"] as const,
  lists: () => [...employeeKeys.all, "list"] as const,
  list: (params: EmployeeListParams) => [...employeeKeys.lists(), params] as const,
  details: () => [...employeeKeys.all, "detail"] as const,
  detail: (id: string) => [...employeeKeys.details(), id] as const,
};

export function useEmployees(params: EmployeeListParams = {}) {
  return useQuery({
    queryKey: employeeKeys.list(params),
    queryFn: () => employeeService.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useEmployee(id: string, enabled = true) {
  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: () => employeeService.get(id),
    enabled: enabled && id.length > 0,
    select: (data) => data.employee,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEmployeeData) => employeeService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: employeeKeys.lists() }),
  });
}

export function useUpdateEmployee(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateEmployeeData) => employeeService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employeeService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: employeeKeys.lists() }),
  });
}

export function useRestoreEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employeeService.restore(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: employeeKeys.lists() }),
  });
}
