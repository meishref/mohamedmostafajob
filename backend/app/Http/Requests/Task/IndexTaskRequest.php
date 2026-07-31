<?php

namespace App\Http\Requests\Task;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return ($user?->can('tasks.view') ?? false) || ($user?->can('tasks.view-own') ?? false);
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:255'],
            'assigned_to' => ['nullable', 'uuid', Rule::exists('employees', 'id')],
            'task_status_id' => ['nullable', 'uuid', Rule::exists('task_statuses', 'id')],
            'priority_id' => ['nullable', 'uuid', Rule::exists('priorities', 'id')],
            'department_id' => ['nullable', 'uuid', Rule::exists('departments', 'id')],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'sort_by' => ['nullable', 'string', Rule::in(['title', 'due_date', 'start_date', 'created_at', 'updated_at'])],
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
            'assigned_to' => $this->input('assigned_to'),
            'task_status_id' => $this->input('task_status_id'),
            'priority_id' => $this->input('priority_id'),
            'department_id' => $this->input('department_id'),
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
