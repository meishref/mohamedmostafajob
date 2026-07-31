<?php

namespace App\Http\Requests\Employee;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('employees.view') ?? false;
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:255'],
            'department_id' => ['nullable', 'uuid', Rule::exists('departments', 'id')],
            'job_title_id' => ['nullable', 'uuid', Rule::exists('job_titles', 'id')],
            'employee_status_id' => ['nullable', 'uuid', Rule::exists('employee_statuses', 'id')],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'sort_by' => ['nullable', 'string', Rule::in([
                'first_name', 'last_name', 'email', 'employee_number', 'hire_date', 'created_at', 'updated_at',
            ])],
            'sort_direction' => ['nullable', 'string', Rule::in(['asc', 'desc'])],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
            'trashed' => ['nullable', 'string', Rule::in(['with', 'only', 'without'])],
        ];
    }

    public function filters(): array
    {
        return [
            'search' => $this->input('search'),
            'department_id' => $this->input('department_id'),
            'job_title_id' => $this->input('job_title_id'),
            'employee_status_id' => $this->input('employee_status_id'),
            'date_from' => $this->input('date_from'),
            'date_to' => $this->input('date_to'),
            'sort_by' => $this->input('sort_by', 'created_at'),
            'sort_direction' => $this->input('sort_direction', 'desc'),
            'per_page' => (int) $this->input('per_page', 15),
            'page' => (int) $this->input('page', 1),
            'trashed' => $this->input('trashed', 'without'),
        ];
    }
}
