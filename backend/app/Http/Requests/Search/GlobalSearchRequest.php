<?php

namespace App\Http\Requests\Search;

use Illuminate\Foundation\Http\FormRequest;

class GlobalSearchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user();
    }

    public function rules(): array
    {
        return [
            'q' => ['required', 'string', 'min:1', 'max:255'],
        ];
    }
}
