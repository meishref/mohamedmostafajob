<?php

namespace App\Http\Requests\User;

use App\Models\User;
use App\Support\Roles;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AssignRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        $target = User::query()->find($this->route('user'));

        return $target && (bool) $this->user()?->can('assignRole', $target);
    }

    public function rules(): array
    {
        return [
            'role' => ['required', 'string', Rule::in(Roles::assignable())],
        ];
    }
}
