export interface Expense {
  id: string;
  expense_number: string;
  category_id: string;
  category?: { id: string; name: string; code: string } | null;
  platform_id: string | null;
  platform?: { id: string; name: string; code: string } | null;
  amount: string | number;
  currency: string;
  expense_date: string;
  notes: string | null;
  attachment_path: string | null;
  attachment_url: string | null;
  attachment_name: string | null;
  created_by: string;
  creator?: { id: string; name: string; email: string } | null;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExpenseListParams {
  search?: string;
  category_id?: string;
  platform_id?: string;
  currency?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_direction?: "asc" | "desc";
  per_page?: number;
  page?: number;
  trashed?: "with" | "only" | "without";
}

export interface ExpenseResponse {
  expense: Expense;
}

export interface CreateExpenseData {
  category_id: string;
  platform_id?: string;
  amount: number;
  currency: string;
  expense_date: string;
  notes?: string;
  attachment?: File;
}

export interface UpdateExpenseData {
  category_id?: string;
  platform_id?: string | null;
  amount?: number;
  currency?: string;
  expense_date?: string;
  notes?: string | null;
  attachment?: File;
}

export interface CurrencyOption {
  code: string;
  label: string;
}
