<?php

namespace App\Http\Requests\Task;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('tasks.create') ?? false;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'assigned_to' => ['required', 'uuid', Rule::exists('employees', 'id')],
            'task_status_id' => ['required', 'uuid', Rule::exists('task_statuses', 'id')],
            'priority_id' => ['required', 'uuid', Rule::exists('priorities', 'id')],
            'start_date' => ['nullable', 'date'],
            'due_date' => ['required', 'date', 'after_or_equal:start_date'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
