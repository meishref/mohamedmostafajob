"use client";

import { expenseService } from "@/services/expense.service";
import type { CreateExpenseData, ExpenseListParams, UpdateExpenseData } from "@/types/expenses";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const expenseKeys = {
  all: ["expenses"] as const,
  lists: () => [...expenseKeys.all, "list"] as const,
  list: (params: ExpenseListParams) => [...expenseKeys.lists(), params] as const,
  details: () => [...expenseKeys.all, "detail"] as const,
  detail: (id: string) => [...expenseKeys.details(), id] as const,
  currencies: () => [...expenseKeys.all, "currencies"] as const,
};

export function useExpenses(params: ExpenseListParams = {}) {
  return useQuery({
    queryKey: expenseKeys.list(params),
    queryFn: () => expenseService.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useExpense(id: string, enabled = true) {
  return useQuery({
    queryKey: expenseKeys.detail(id),
    queryFn: () => expenseService.get(id),
    enabled: enabled && id.length > 0,
    select: (data) => data.expense,
  });
}

export function useCurrencies(enabled = true) {
  return useQuery({
    queryKey: expenseKeys.currencies(),
    queryFn: () => expenseService.getCurrencies(),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExpenseData) => expenseService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: expenseKeys.lists() }),
  });
}

export function useUpdateExpense(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateExpenseData) => expenseService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: expenseKeys.detail(id) });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expenseService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: expenseKeys.lists() }),
  });
}

export function useRestoreExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expenseService.restore(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: expenseKeys.lists() }),
  });
}
