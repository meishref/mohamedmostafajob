<?php

namespace App\Http\Requests\User;

use App\Enums\UserStatus;
use App\Models\User;
use App\Support\Roles;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        $target = User::query()->find($this->route('user'));

        return $target && (bool) $this->user()?->can('update', $target);
    }

    public function rules(): array
    {
        $userId = $this->route('user');

        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => [
                'sometimes',
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            'phone' => ['nullable', 'string', 'max:20'],
            'status' => ['sometimes', Rule::enum(UserStatus::class)],
            'role' => ['sometimes', 'string', Rule::in(Roles::assignable())],
            'profile_image' => ['nullable', 'image', 'max:2048'],
        ];
    }
}
