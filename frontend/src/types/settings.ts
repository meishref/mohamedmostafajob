import type { PaginatedMeta } from "./api";

export type SettingsResourceSlug =
  | "departments"
  | "job-titles"
  | "employee-statuses"
  | "task-statuses"
  | "priorities"
  | "payment-types"
  | "payment-statuses"
  | "expense-categories"
  | "advertising-platforms"
  | "exchange-rates";

export interface SettingsResourceMeta {
  slug: SettingsResourceSlug;
  label: string;
}

export interface LookupListParams {
  search?: string;
  is_active?: string;
  sort_by?: string;
  sort_direction?: "asc" | "desc";
  per_page?: number;
  page?: number;
  trashed?: "with" | "only" | "without";
}

export interface LookupRecord {
  id: string;
  [key: string]: unknown;
  name?: string;
  code?: string;
  description?: string;
  color?: string | null;
  is_active?: boolean;
  sort_order?: number;
  level?: number;
  is_default?: boolean;
  is_closed?: boolean;
  is_final?: boolean;
  parent_id?: string | null;
  parent?: { id: string; name: string; code: string } | null;
  department_id?: string | null;
  department?: { id: string; name: string; code: string } | null;
  from_currency?: string;
  to_currency?: string;
  rate?: string | number;
  effective_date?: string;
  website?: string | null;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface LookupOption {
  id: string;
  name: string;
  code?: string | null;
  label: string;
}

export interface LookupListResponse {
  items: LookupRecord[];
  meta: PaginatedMeta;
}

export interface LookupItemResponse {
  item: LookupRecord;
}

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "color"
  | "date"
  | "url"
  | "lookup";

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  lookupResource?: SettingsResourceSlug;
  excludeSelf?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

export interface ColumnConfig {
  key: string;
  label: string;
  sortable?: boolean;
}

export interface SettingsResourceConfig {
  slug: SettingsResourceSlug;
  label: string;
  singularLabel: string;
  fields: FieldConfig[];
  columns: ColumnConfig[];
  hasActiveFilter?: boolean;
}
