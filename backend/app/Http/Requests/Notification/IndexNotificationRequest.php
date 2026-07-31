<?php

namespace App\Http\Requests\Notification;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexNotificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user();
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:255'],
            'type' => ['nullable', 'string', 'max:100'],
            'read' => ['nullable', 'string', Rule::in(['read', 'unread'])],
            'sort_by' => ['nullable', 'string', Rule::in(['created_at', 'read_at', 'type', 'title'])],
            'sort_direction' => ['nullable', 'string', Rule::in(['asc', 'desc'])],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }

    public function filters(): array
    {
        return [
            'search' => $this->input('search'),
            'type' => $this->input('type'),
            'read' => $this->input('read'),
            'sort_by' => $this->input('sort_by', 'created_at'),
            'sort_direction' => $this->input('sort_direction', 'desc'),
            'per_page' => (int) $this->input('per_page', 15),
            'page' => (int) $this->input('page', 1),
        ];
    }
}
