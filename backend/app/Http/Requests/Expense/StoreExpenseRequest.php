<?php

namespace App\Http\Requests\Expense;

use App\Support\FileUploadConfig;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('expenses.create') ?? false;
    }

    public function rules(): array
    {
        return [
            'category_id' => ['required', 'uuid', Rule::exists('expense_categories', 'id')],
            'platform_id' => ['nullable', 'uuid', Rule::exists('advertising_platforms', 'id')],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'currency' => ['required', 'string', 'size:3'],
            'expense_date' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
            'attachment' => FileUploadConfig::validationRules(),
        ];
    }
}
