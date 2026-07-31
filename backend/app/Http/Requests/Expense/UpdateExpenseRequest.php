<?php

namespace App\Http\Requests\Expense;

use App\Support\FileUploadConfig;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('expenses.update') ?? false;
    }

    public function rules(): array
    {
        return [
            'category_id' => ['sometimes', 'required', 'uuid', Rule::exists('expense_categories', 'id')],
            'platform_id' => ['nullable', 'uuid', Rule::exists('advertising_platforms', 'id')],
            'amount' => ['sometimes', 'required', 'numeric', 'min:0.01'],
            'currency' => ['sometimes', 'required', 'string', 'size:3'],
            'expense_date' => ['sometimes', 'required', 'date'],
            'notes' => ['nullable', 'string'],
            'attachment' => FileUploadConfig::validationRules(),
        ];
    }
}
