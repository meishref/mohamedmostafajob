<?php

namespace App\Http\Requests\Employee;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('employees.update') ?? false;
    }

    public function rules(): array
    {
        $employeeId = $this->route('employee');

        return [
            'full_name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'string', 'email', 'max:255', Rule::unique('employees', 'email')->ignore($employeeId)],
            'phone' => ['nullable', 'string', 'max:20'],
            'department_id' => ['nullable', 'uuid', Rule::exists('departments', 'id')],
            'job_title_id' => ['nullable', 'uuid', Rule::exists('job_titles', 'id')],
            'employee_status_id' => ['sometimes', 'required', 'uuid', Rule::exists('employee_statuses', 'id')],
            'hire_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
            'profile_image' => ['nullable', 'image', 'max:2048'],
        ];
    }
}
