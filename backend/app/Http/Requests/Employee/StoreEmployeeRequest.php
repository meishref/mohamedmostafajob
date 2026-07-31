<?php

namespace App\Http\Requests\Employee;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('employees.create') ?? false;
    }

    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:employees,email'],
            'phone' => ['nullable', 'string', 'max:20'],
            'department_id' => ['nullable', 'uuid', Rule::exists('departments', 'id')],
            'job_title_id' => ['nullable', 'uuid', Rule::exists('job_titles', 'id')],
            'employee_status_id' => ['required', 'uuid', Rule::exists('employee_statuses', 'id')],
            'hire_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
            'profile_image' => ['nullable', 'image', 'max:2048'],
        ];
    }
}
