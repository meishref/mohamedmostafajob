<?php

namespace App\Http\Requests\User;

use App\Enums\UserStatus;
use App\Models\User;
use App\Support\Roles;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->can('create', User::class);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'phone' => ['nullable', 'string', 'max:20'],
            'status' => ['nullable', Rule::enum(UserStatus::class)],
            'role' => ['required', 'string', Rule::in(Roles::assignable())],
            'profile_image' => ['nullable', 'image', 'max:2048'],
        ];
    }
}
