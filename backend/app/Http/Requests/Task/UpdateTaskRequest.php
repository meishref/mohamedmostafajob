<?php

namespace App\Http\Requests\Task;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('tasks.update') ?? false;
    }

    public function rules(): array
    {
        return [
            'assigned_to' => ['sometimes', 'required', 'uuid', Rule::exists('employees', 'id')],
            'task_status_id' => ['sometimes', 'required', 'uuid', Rule::exists('task_statuses', 'id')],
            'priority_id' => ['sometimes', 'required', 'uuid', Rule::exists('priorities', 'id')],
            'start_date' => ['nullable', 'date'],
            'due_date' => ['sometimes', 'required', 'date'],
            'description' => ['sometimes', 'required', 'string'],
            'notes' => ['nullable', 'string'],
            'title' => ['sometimes', 'required', 'string', 'max:255'],
        ];
    }
}
