<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AssignRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('users.update') ?? false;
    }

    public function rules(): array
    {
        return [
            'role' => ['required', 'string', Rule::exists('roles', 'name')],
        ];
    }
}
