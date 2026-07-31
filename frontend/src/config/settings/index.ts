import type { SettingsResourceConfig, SettingsResourceSlug } from "@/types/settings";

const baseCodeNameFields = [
  { name: "name", label: "Name", type: "text" as const, required: true },
  { name: "code", label: "Code", type: "text" as const, required: true, placeholder: "unique-code" },
];

export const settingsResources: Record<SettingsResourceSlug, SettingsResourceConfig> = {
  departments: {
    slug: "departments",
    label: "Departments",
    singularLabel: "Department",
    hasActiveFilter: true,
    fields: [
      ...baseCodeNameFields,
      { name: "description", label: "Description", type: "textarea" },
      { name: "parent_id", label: "Parent Department", type: "lookup", lookupResource: "departments", excludeSelf: true },
      { name: "is_active", label: "Active", type: "boolean" },
    ],
    columns: [
      { key: "name", label: "Name", sortable: true },
      { key: "code", label: "Code", sortable: true },
      { key: "parent.name", label: "Parent" },
      { key: "is_active", label: "Active" },
      { key: "created_at", label: "Created", sortable: true },
    ],
  },
  "job-titles": {
    slug: "job-titles",
    label: "Job Titles",
    singularLabel: "Job Title",
    hasActiveFilter: true,
    fields: [
      ...baseCodeNameFields,
      { name: "description", label: "Description", type: "textarea" },
      { name: "department_id", label: "Department", type: "lookup", lookupResource: "departments" },
      { name: "is_active", label: "Active", type: "boolean" },
    ],
    columns: [
      { key: "name", label: "Name", sortable: true },
      { key: "code", label: "Code", sortable: true },
      { key: "department.name", label: "Department" },
      { key: "is_active", label: "Active" },
      { key: "created_at", label: "Created", sortable: true },
    ],
  },
  "employee-statuses": {
    slug: "employee-statuses",
    label: "Employee Statuses",
    singularLabel: "Employee Status",
    hasActiveFilter: true,
    fields: [
      ...baseCodeNameFields,
      { name: "color", label: "Color", type: "color" },
      { name: "sort_order", label: "Sort Order", type: "number", min: 0 },
      { name: "is_active", label: "Active", type: "boolean" },
    ],
    columns: [
      { key: "name", label: "Name", sortable: true },
      { key: "code", label: "Code", sortable: true },
      { key: "color", label: "Color" },
      { key: "sort_order", label: "Order", sortable: true },
      { key: "is_active", label: "Active" },
    ],
  },
  "task-statuses": {
    slug: "task-statuses",
    label: "Task Statuses",
    singularLabel: "Task Status",
    fields: [
      ...baseCodeNameFields,
      { name: "color", label: "Color", type: "color" },
      { name: "sort_order", label: "Sort Order", type: "number", min: 0 },
      { name: "is_default", label: "Default", type: "boolean" },
      { name: "is_closed", label: "Closed", type: "boolean" },
    ],
    columns: [
      { key: "name", label: "Name", sortable: true },
      { key: "code", label: "Code", sortable: true },
      { key: "color", label: "Color" },
      { key: "sort_order", label: "Order", sortable: true },
      { key: "is_default", label: "Default" },
      { key: "is_closed", label: "Closed" },
    ],
  },
  priorities: {
    slug: "priorities",
    label: "Task Priorities",
    singularLabel: "Priority",
    fields: [
      ...baseCodeNameFields,
      { name: "level", label: "Level", type: "number", required: true, min: 0, max: 100 },
      { name: "color", label: "Color", type: "color" },
    ],
    columns: [
      { key: "name", label: "Name", sortable: true },
      { key: "code", label: "Code", sortable: true },
      { key: "level", label: "Level", sortable: true },
      { key: "color", label: "Color" },
    ],
  },
  "payment-types": {
    slug: "payment-types",
    label: "Payment Types",
    singularLabel: "Payment Type",
    hasActiveFilter: true,
    fields: [
      ...baseCodeNameFields,
      { name: "description", label: "Description", type: "textarea" },
      { name: "is_active", label: "Active", type: "boolean" },
    ],
    columns: [
      { key: "name", label: "Name", sortable: true },
      { key: "code", label: "Code", sortable: true },
      { key: "is_active", label: "Active" },
      { key: "created_at", label: "Created", sortable: true },
    ],
  },
  "payment-statuses": {
    slug: "payment-statuses",
    label: "Payment Statuses",
    singularLabel: "Payment Status",
    fields: [
      ...baseCodeNameFields,
      { name: "color", label: "Color", type: "color" },
      { name: "is_final", label: "Final", type: "boolean" },
    ],
    columns: [
      { key: "name", label: "Name", sortable: true },
      { key: "code", label: "Code", sortable: true },
      { key: "color", label: "Color" },
      { key: "is_final", label: "Final" },
    ],
  },
  "expense-categories": {
    slug: "expense-categories",
    label: "Expense Categories",
    singularLabel: "Expense Category",
    hasActiveFilter: true,
    fields: [
      ...baseCodeNameFields,
      { name: "description", label: "Description", type: "textarea" },
      { name: "is_active", label: "Active", type: "boolean" },
    ],
    columns: [
      { key: "name", label: "Name", sortable: true },
      { key: "code", label: "Code", sortable: true },
      { key: "is_active", label: "Active" },
      { key: "created_at", label: "Created", sortable: true },
    ],
  },
  "advertising-platforms": {
    slug: "advertising-platforms",
    label: "Advertising Platforms",
    singularLabel: "Advertising Platform",
    hasActiveFilter: true,
    fields: [
      ...baseCodeNameFields,
      { name: "website", label: "Website", type: "url", placeholder: "https://example.com" },
      { name: "is_active", label: "Active", type: "boolean" },
    ],
    columns: [
      { key: "name", label: "Name", sortable: true },
      { key: "code", label: "Code", sortable: true },
      { key: "website", label: "Website" },
      { key: "is_active", label: "Active" },
    ],
  },
  "exchange-rates": {
    slug: "exchange-rates",
    label: "Exchange Rates",
    singularLabel: "Exchange Rate",
    fields: [
      { name: "from_currency", label: "From Currency", type: "text", required: true, placeholder: "USD" },
      { name: "to_currency", label: "To Currency", type: "text", required: true, placeholder: "EUR" },
      { name: "rate", label: "Rate", type: "number", required: true, min: 0, step: 0.000001 },
      { name: "effective_date", label: "Effective Date", type: "date", required: true },
    ],
    columns: [
      { key: "from_currency", label: "From", sortable: true },
      { key: "to_currency", label: "To", sortable: true },
      { key: "rate", label: "Rate", sortable: true },
      { key: "effective_date", label: "Effective Date", sortable: true },
    ],
  },
};

export function getSettingsConfig(slug: string): SettingsResourceConfig | null {
  return settingsResources[slug as SettingsResourceSlug] ?? null;
}

export function getAllSettingsNavItems() {
  return Object.values(settingsResources).map(({ slug, label }) => ({ slug, label }));
}

export function getNestedValue(obj: object, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}
