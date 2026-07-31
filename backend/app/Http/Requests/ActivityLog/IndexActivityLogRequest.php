<?php

namespace App\Http\Requests\ActivityLog;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexActivityLogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('activity-logs.view') ?? false;
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:255'],
            'module' => ['nullable', 'string', 'max:50'],
            'action' => ['nullable', 'string', 'max:50'],
            'user_id' => ['nullable', 'uuid', Rule::exists('users', 'id')],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'sort_by' => ['nullable', 'string', Rule::in(['created_at', 'action', 'module'])],
            'sort_direction' => ['nullable', 'string', Rule::in(['asc', 'desc'])],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }

    public function filters(): array
    {
        return [
            'search' => $this->input('search'),
            'module' => $this->input('module'),
            'action' => $this->input('action'),
            'user_id' => $this->input('user_id'),
            'date_from' => $this->input('date_from'),
            'date_to' => $this->input('date_to'),
            'sort_by' => $this->input('sort_by', 'created_at'),
            'sort_direction' => $this->input('sort_direction', 'desc'),
            'per_page' => (int) $this->input('per_page', 15),
            'page' => (int) $this->input('page', 1),
        ];
    }
}
