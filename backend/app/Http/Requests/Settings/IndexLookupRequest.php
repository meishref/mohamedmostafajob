<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexLookupRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('settings.view') ?? false;
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable'],
            'sort_by' => ['nullable', 'string', 'max:50'],
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
            'is_active' => $this->input('is_active'),
            'sort_by' => $this->input('sort_by', 'created_at'),
            'sort_direction' => $this->input('sort_direction', 'desc'),
            'per_page' => (int) $this->input('per_page', 15),
            'page' => (int) $this->input('page', 1),
            'trashed' => $this->input('trashed', 'without'),
        ];
    }
}
