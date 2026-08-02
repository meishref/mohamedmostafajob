<?php

namespace App\Http\Requests\User;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class ResetUserPasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        $target = User::query()->find($this->route('user'));

        return $target && (bool) $this->user()?->can('resetPassword', $target);
    }

    public function rules(): array
    {
        return [
            'password' => ['required', 'confirmed', Password::defaults()],
        ];
    }
}
