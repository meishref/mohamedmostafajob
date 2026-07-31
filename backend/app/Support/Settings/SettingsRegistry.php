<?php

namespace App\Support\Settings;

use App\Http\Resources\Settings\AdvertisingPlatformResource;
use App\Http\Resources\Settings\DepartmentResource;
use App\Http\Resources\Settings\EmployeeStatusResource;
use App\Http\Resources\Settings\ExchangeRateResource;
use App\Http\Resources\Settings\ExpenseCategoryResource;
use App\Http\Resources\Settings\JobTitleResource;
use App\Http\Resources\Settings\PaymentStatusResource;
use App\Http\Resources\Settings\PaymentTypeResource;
use App\Http\Resources\Settings\PriorityResource;
use App\Http\Resources\Settings\TaskStatusResource;
use App\Models\AdvertisingPlatform;
use App\Models\Department;
use App\Models\EmployeeStatus;
use App\Models\ExchangeRate;
use App\Models\ExpenseCategory;
use App\Models\JobTitle;
use App\Models\PaymentStatus;
use App\Models\PaymentType;
use App\Models\Priority;
use App\Models\TaskStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\Rule;

class SettingsRegistry
{
    /** @return array<string, array<string, mixed>> */
    public static function all(): array
    {
        return [
            'departments' => [
                'label' => 'Departments',
                'model' => Department::class,
                'resource' => DepartmentResource::class,
                'searchable' => ['name', 'code', 'description'],
                'sortable' => ['name', 'code', 'created_at'],
                'relations' => ['parent'],
                'store_rules' => fn (?string $id = null) => [
                    'name' => ['required', 'string', 'max:255'],
                    'code' => ['required', 'string', 'max:50', Rule::unique('departments', 'code')->ignore($id)],
                    'description' => ['nullable', 'string'],
                    'parent_id' => ['nullable', 'uuid', Rule::exists('departments', 'id')],
                    'is_active' => ['sometimes', 'boolean'],
                ],
            ],
            'job-titles' => [
                'label' => 'Job Titles',
                'model' => JobTitle::class,
                'resource' => JobTitleResource::class,
                'searchable' => ['name', 'code', 'description'],
                'sortable' => ['name', 'code', 'created_at'],
                'relations' => ['department'],
                'store_rules' => fn (?string $id = null) => [
                    'name' => ['required', 'string', 'max:255'],
                    'code' => ['required', 'string', 'max:50', Rule::unique('job_titles', 'code')->ignore($id)],
                    'description' => ['nullable', 'string'],
                    'department_id' => ['nullable', 'uuid', Rule::exists('departments', 'id')],
                    'is_active' => ['sometimes', 'boolean'],
                ],
            ],
            'employee-statuses' => [
                'label' => 'Employee Statuses',
                'model' => EmployeeStatus::class,
                'resource' => EmployeeStatusResource::class,
                'searchable' => ['name', 'code'],
                'sortable' => ['name', 'code', 'sort_order', 'created_at'],
                'relations' => [],
                'store_rules' => fn (?string $id = null) => [
                    'name' => ['required', 'string', 'max:255'],
                    'code' => ['required', 'string', 'max:50', Rule::unique('employee_statuses', 'code')->ignore($id)],
                    'color' => ['nullable', 'string', 'max:20'],
                    'is_active' => ['sometimes', 'boolean'],
                    'sort_order' => ['sometimes', 'integer', 'min:0'],
                ],
            ],
            'task-statuses' => [
                'label' => 'Task Statuses',
                'model' => TaskStatus::class,
                'resource' => TaskStatusResource::class,
                'searchable' => ['name', 'code'],
                'sortable' => ['name', 'code', 'sort_order', 'created_at'],
                'relations' => [],
                'store_rules' => fn (?string $id = null) => [
                    'name' => ['required', 'string', 'max:255'],
                    'code' => ['required', 'string', 'max:50', Rule::unique('task_statuses', 'code')->ignore($id)],
                    'color' => ['nullable', 'string', 'max:20'],
                    'sort_order' => ['sometimes', 'integer', 'min:0'],
                    'is_default' => ['sometimes', 'boolean'],
                    'is_closed' => ['sometimes', 'boolean'],
                ],
            ],
            'priorities' => [
                'label' => 'Task Priorities',
                'model' => Priority::class,
                'resource' => PriorityResource::class,
                'searchable' => ['name', 'code'],
                'sortable' => ['name', 'code', 'level', 'created_at'],
                'relations' => [],
                'store_rules' => fn (?string $id = null) => [
                    'name' => ['required', 'string', 'max:255'],
                    'code' => ['required', 'string', 'max:50', Rule::unique('priorities', 'code')->ignore($id)],
                    'level' => ['required', 'integer', 'min:0', 'max:100'],
                    'color' => ['nullable', 'string', 'max:20'],
                ],
            ],
            'payment-types' => [
                'label' => 'Payment Types',
                'model' => PaymentType::class,
                'resource' => PaymentTypeResource::class,
                'searchable' => ['name', 'code', 'description'],
                'sortable' => ['name', 'code', 'created_at'],
                'relations' => [],
                'store_rules' => fn (?string $id = null) => [
                    'name' => ['required', 'string', 'max:255'],
                    'code' => ['required', 'string', 'max:50', Rule::unique('payment_types', 'code')->ignore($id)],
                    'description' => ['nullable', 'string'],
                    'is_active' => ['sometimes', 'boolean'],
                ],
            ],
            'payment-statuses' => [
                'label' => 'Payment Statuses',
                'model' => PaymentStatus::class,
                'resource' => PaymentStatusResource::class,
                'searchable' => ['name', 'code'],
                'sortable' => ['name', 'code', 'created_at'],
                'relations' => [],
                'store_rules' => fn (?string $id = null) => [
                    'name' => ['required', 'string', 'max:255'],
                    'code' => ['required', 'string', 'max:50', Rule::unique('payment_statuses', 'code')->ignore($id)],
                    'color' => ['nullable', 'string', 'max:20'],
                    'is_final' => ['sometimes', 'boolean'],
                ],
            ],
            'expense-categories' => [
                'label' => 'Expense Categories',
                'model' => ExpenseCategory::class,
                'resource' => ExpenseCategoryResource::class,
                'searchable' => ['name', 'code', 'description'],
                'sortable' => ['name', 'code', 'created_at'],
                'relations' => [],
                'store_rules' => fn (?string $id = null) => [
                    'name' => ['required', 'string', 'max:255'],
                    'code' => ['required', 'string', 'max:50', Rule::unique('expense_categories', 'code')->ignore($id)],
                    'description' => ['nullable', 'string'],
                    'is_active' => ['sometimes', 'boolean'],
                ],
            ],
            'advertising-platforms' => [
                'label' => 'Advertising Platforms',
                'model' => AdvertisingPlatform::class,
                'resource' => AdvertisingPlatformResource::class,
                'searchable' => ['name', 'code', 'website'],
                'sortable' => ['name', 'code', 'created_at'],
                'relations' => [],
                'store_rules' => fn (?string $id = null) => [
                    'name' => ['required', 'string', 'max:255'],
                    'code' => ['required', 'string', 'max:50', Rule::unique('advertising_platforms', 'code')->ignore($id)],
                    'website' => ['nullable', 'string', 'max:255', 'url'],
                    'is_active' => ['sometimes', 'boolean'],
                ],
            ],
            'exchange-rates' => [
                'label' => 'Exchange Rates',
                'model' => ExchangeRate::class,
                'resource' => ExchangeRateResource::class,
                'searchable' => ['from_currency', 'to_currency'],
                'sortable' => ['from_currency', 'to_currency', 'effective_date', 'created_at'],
                'relations' => [],
                'store_rules' => fn (?string $id = null) => [
                    'from_currency' => ['required', 'string', 'size:3'],
                    'to_currency' => ['required', 'string', 'size:3', 'different:from_currency'],
                    'rate' => ['required', 'numeric', 'min:0.000001'],
                    'effective_date' => ['required', 'date'],
                ],
            ],
        ];
    }

    public static function get(string $resource): array
    {
        $config = self::all()[$resource] ?? null;

        if (! $config) {
            abort(404, 'Settings resource not found.');
        }

        return $config;
    }

    /** @return class-string<Model> */
    public static function modelClass(string $resource): string
    {
        return self::get($resource)['model'];
    }

    /** @return class-string */
    public static function resourceClass(string $resource): string
    {
        return self::get($resource)['resource'];
    }

    public static function slugs(): array
    {
        return array_keys(self::all());
    }
}
