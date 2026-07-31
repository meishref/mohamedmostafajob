"use client";

import { paymentService } from "@/services/payment.service";
import type { CreatePaymentData, PaymentListParams, UpdatePaymentData } from "@/types/payments";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const paymentKeys = {
  all: ["payments"] as const,
  lists: () => [...paymentKeys.all, "list"] as const,
  list: (params: PaymentListParams) => [...paymentKeys.lists(), params] as const,
  details: () => [...paymentKeys.all, "detail"] as const,
  detail: (id: string) => [...paymentKeys.details(), id] as const,
};

export function usePayments(params: PaymentListParams = {}) {
  return useQuery({
    queryKey: paymentKeys.list(params),
    queryFn: () => paymentService.list(params),
    placeholderData: (prev) => prev,
  });
}

export function usePayment(id: string, enabled = true) {
  return useQuery({
    queryKey: paymentKeys.detail(id),
    queryFn: () => paymentService.get(id),
    enabled: enabled && id.length > 0,
    select: (data) => data.payment,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePaymentData) => paymentService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: paymentKeys.lists() }),
  });
}

export function useUpdatePayment(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdatePaymentData) => paymentService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: paymentKeys.detail(id) });
    },
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => paymentService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: paymentKeys.lists() }),
  });
}

export function useRestorePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => paymentService.restore(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: paymentKeys.lists() }),
  });
}
