<?php

namespace App\Http\Requests\User;

use App\Enums\UserStatus;
use App\Models\User;
use App\Support\Roles;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class IndexUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->can('viewAny', User::class);
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', Rule::enum(UserStatus::class)],
            'role' => ['nullable', 'string', Rule::in(Roles::assignable())],
            'sort_by' => ['nullable', 'string', Rule::in(['name', 'email', 'status', 'created_at', 'updated_at'])],
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
            'status' => $this->input('status'),
            'role' => $this->input('role'),
            'sort_by' => $this->input('sort_by', 'created_at'),
            'sort_direction' => $this->input('sort_direction', 'desc'),
            'per_page' => (int) $this->input('per_page', 15),
            'page' => (int) $this->input('page', 1),
            'trashed' => $this->input('trashed', 'without'),
        ];
    }
}
