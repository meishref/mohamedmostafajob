<?php

namespace App\Http\Requests\Payment;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('payments.update') ?? false;
    }

    public function rules(): array
    {
        return [
            'employee_id' => ['sometimes', 'uuid', Rule::exists('employees', 'id')],
            'payment_type_id' => ['sometimes', 'uuid', Rule::exists('payment_types', 'id')],
            'payment_status_id' => ['sometimes', 'uuid', Rule::exists('payment_statuses', 'id')],
            'amount' => ['sometimes', 'numeric', 'min:0.01'],
            'currency' => ['sometimes', 'string', 'size:3'],
            'payment_date' => ['sometimes', 'date'],
            'reference' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
