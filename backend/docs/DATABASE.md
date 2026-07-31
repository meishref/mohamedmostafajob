# PostgreSQL Database Design

Business Management System — normalized schema with UUID primary keys.

## Entity Relationship Diagram

```mermaid
erDiagram
    users ||--o| employees : "has"
    users ||--o{ tasks : "creates"
    users ||--o{ payments : "creates"
    users ||--o{ expenses : "creates"
    users ||--o{ expenses : "approves"
    users ||--o{ notifications : "receives"
    users ||--o{ activity_logs : "performs"

    departments ||--o{ departments : "parent"
    departments ||--o| employees : "head"
    departments ||--o{ job_titles : "contains"
    departments ||--o{ employees : "employs"
    departments ||--o{ tasks : "owns"
    departments ||--o{ expenses : "allocates"

    job_titles ||--o{ employees : "defines"
    employee_statuses ||--o{ employees : "status"

    employees ||--o{ tasks : "assigned"
    employees ||--o{ payments : "receives"
    employees ||--o{ expenses : "submits"

    task_statuses ||--o{ tasks : "status"
    priorities ||--o{ tasks : "priority"

    payment_types ||--o{ payments : "type"
    payment_statuses ||--o{ payments : "status"

    expense_categories ||--o{ expenses : "category"
    advertising_platforms ||--o{ expenses : "platform"

    users {
        uuid id PK
        string name
        string email UK
        timestamp email_verified_at
        string password
        string phone
        string profile_image
        string status
        string google_id UK
        timestamps created_at updated_at
        timestamp deleted_at
    }

    departments {
        uuid id PK
        string name
        string code UK
        text description
        uuid parent_id FK
        uuid head_employee_id FK
        boolean is_active
        timestamps created_at updated_at
        timestamp deleted_at
    }

    job_titles {
        uuid id PK
        string name
        string code UK
        text description
        uuid department_id FK
        boolean is_active
        timestamps created_at updated_at
        timestamp deleted_at
    }

    employee_statuses {
        uuid id PK
        string name
        string code UK
        string color
        boolean is_active
        smallint sort_order
        timestamps created_at updated_at
        timestamp deleted_at
    }

    employees {
        uuid id PK
        uuid user_id FK UK
        string employee_number UK
        string first_name
        string last_name
        string email UK
        string phone
        uuid department_id FK
        uuid job_title_id FK
        uuid employee_status_id FK
        date hire_date
        date termination_date
        string profile_image
        timestamps created_at updated_at
        timestamp deleted_at
    }

    task_statuses {
        uuid id PK
        string name
        string code UK
        string color
        smallint sort_order
        boolean is_default
        boolean is_closed
        timestamps created_at updated_at
        timestamp deleted_at
    }

    priorities {
        uuid id PK
        string name
        string code UK
        smallint level
        string color
        timestamps created_at updated_at
        timestamp deleted_at
    }

    tasks {
        uuid id PK
        string title
        text description
        uuid assigned_to FK
        uuid created_by FK
        uuid department_id FK
        uuid task_status_id FK
        uuid priority_id FK
        date due_date
        timestamp completed_at
        timestamps created_at updated_at
        timestamp deleted_at
    }

    payment_types {
        uuid id PK
        string name
        string code UK
        text description
        boolean is_active
        timestamps created_at updated_at
        timestamp deleted_at
    }

    payment_statuses {
        uuid id PK
        string name
        string code UK
        string color
        boolean is_final
        timestamps created_at updated_at
        timestamp deleted_at
    }

    payments {
        uuid id PK
        string payment_number UK
        uuid employee_id FK
        uuid payment_type_id FK
        uuid payment_status_id FK
        decimal amount
        char currency
        date payment_date
        string reference
        text notes
        uuid created_by FK
        timestamps created_at updated_at
        timestamp deleted_at
    }

    expense_categories {
        uuid id PK
        string name
        string code UK
        text description
        boolean is_active
        timestamps created_at updated_at
        timestamp deleted_at
    }

    advertising_platforms {
        uuid id PK
        string name
        string code UK
        string website
        boolean is_active
        timestamps created_at updated_at
        timestamp deleted_at
    }

    expenses {
        uuid id PK
        string expense_number UK
        uuid category_id FK
        uuid platform_id FK
        uuid employee_id FK
        uuid department_id FK
        decimal amount
        char currency
        date expense_date
        text description
        string receipt_path
        uuid approved_by FK
        timestamp approved_at
        uuid created_by FK
        timestamps created_at updated_at
        timestamp deleted_at
    }

    exchange_rates {
        uuid id PK
        char from_currency
        char to_currency
        decimal rate
        date effective_date
        timestamps created_at updated_at
        timestamp deleted_at
    }

    notifications {
        uuid id PK
        uuid user_id FK
        string type
        string title
        text message
        json data
        timestamp read_at
        timestamps created_at updated_at
        timestamp deleted_at
    }

    activity_logs {
        uuid id PK
        uuid user_id FK
        string subject_type
        uuid subject_id
        string action
        text description
        json properties
        string ip_address
        text user_agent
        timestamps created_at updated_at
    }
```

## Design Principles

| Principle | Implementation |
|-----------|----------------|
| **UUID Primary Keys** | All business tables use `uuid` PK via `HasUuid` trait |
| **Normalization** | Lookup/reference tables separated from transactional data (3NF) |
| **Foreign Keys** | All relationships enforced with `restrictOnDelete` / `nullOnDelete` |
| **Indexes** | FK columns, search fields, status fields, dates indexed |
| **Timestamps** | `created_at`, `updated_at` on all tables |
| **Soft Deletes** | All tables except `activity_logs` (immutable audit trail) |
| **Audit Trail** | `activity_logs` with polymorphic subject reference |

## Table Groups

### Authentication & Authorization
- `users` — system accounts (Sanctum auth)
- `roles`, `permissions`, pivot tables — Spatie Permission
- `personal_access_tokens`, `sessions`, `password_reset_tokens`

### Organization
- `departments` — hierarchical org structure (self-referencing)
- `job_titles` — positions linked to departments
- `employee_statuses` — employment state lookup
- `employees` — workforce records linked to users

### Operations
- `task_statuses`, `priorities` — task lookup tables
- `tasks` — work items assigned to employees

### Finance
- `payment_types`, `payment_statuses` — payment lookup tables
- `payments` — employee payments
- `expense_categories`, `advertising_platforms` — expense lookup tables
- `expenses` — business expenses
- `exchange_rates` — currency conversion rates

### System
- `notifications` — in-app user notifications
- `activity_logs` — immutable audit log

## Migration Files

| Migration | Tables |
|-----------|--------|
| `0001_01_01_000000_create_users_table` | users, password_reset_tokens, sessions |
| `2026_07_31_154841_create_personal_access_tokens_table` | personal_access_tokens |
| `2026_07_31_154842_create_permission_tables` | permissions, roles, pivots |
| `2026_07_31_180010_create_lookup_tables` | departments, job_titles, employee_statuses, task_statuses, priorities, payment_types, payment_statuses, expense_categories, advertising_platforms |
| `2026_07_31_180020_create_employees_table` | employees (+ departments.head_employee_id) |
| `2026_07_31_180030_create_tasks_table` | tasks |
| `2026_07_31_180040_create_payments_table` | payments |
| `2026_07_31_180050_create_expenses_table` | expenses |
| `2026_07_31_180060_create_system_tables` | exchange_rates, notifications, activity_logs |

## Seeders

| Seeder | Purpose |
|--------|---------|
| `RoleAndPermissionSeeder` | Admin/User roles and permissions |
| `LookupTableSeeder` | All reference/lookup table data |
| `OrganizationSeeder` | Departments, job titles, exchange rates, admin employee |
| `BusinessDataSeeder` | Sample employees, tasks, payments, expenses |

## Setup

```bash
cd backend
php artisan migrate:fresh --seed
```

> **Note:** UUID migration requires a fresh migration. Existing bigint user IDs are replaced with UUIDs. Run `migrate:fresh` on development environments.

## Default Credentials

- **Admin:** admin@example.com / password
