import type { Attachment } from "./attachments";

export interface Payment {
  id: string;
  payment_number: string;
  employee_id: string | null;
  employee?: { id: string; full_name: string; employee_number: string } | null;
  payment_type_id: string;
  payment_type?: { id: string; name: string; code: string } | null;
  payment_status_id: string;
  payment_status?: { id: string; name: string; code: string; color?: string | null } | null;
  amount: string | number;
  currency: string;
  payment_date: string | null;
  reference: string | null;
  notes: string | null;
  attachments?: Attachment[];
  created_by: string;
  creator?: { id: string; name: string; email: string } | null;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentListParams {
  search?: string;
  employee_id?: string;
  payment_type_id?: string;
  payment_status_id?: string;
  currency?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_direction?: "asc" | "desc";
  per_page?: number;
  page?: number;
  trashed?: "with" | "only" | "without";
}

export interface PaymentResponse {
  payment: Payment;
}

export interface CreatePaymentData {
  employee_id: string;
  payment_type_id: string;
  payment_status_id: string;
  amount: number;
  currency: string;
  payment_date: string;
  reference?: string;
  notes?: string;
}

export interface UpdatePaymentData {
  employee_id?: string;
  payment_type_id?: string;
  payment_status_id?: string;
  amount?: number;
  currency?: string;
  payment_date?: string;
  reference?: string | null;
  notes?: string | null;
}
