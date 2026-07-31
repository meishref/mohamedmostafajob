<?php

namespace App\Http\Requests\Payment;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('payments.create') ?? false;
    }

    public function rules(): array
    {
        return [
            'employee_id' => ['required', 'uuid', Rule::exists('employees', 'id')],
            'payment_type_id' => ['required', 'uuid', Rule::exists('payment_types', 'id')],
            'payment_status_id' => ['required', 'uuid', Rule::exists('payment_statuses', 'id')],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'currency' => ['required', 'string', 'size:3'],
            'payment_date' => ['required', 'date'],
            'reference' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
