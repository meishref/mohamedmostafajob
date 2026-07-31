<?php

namespace App\Http\Requests\Payment;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('payments.view') ?? false;
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:255'],
            'employee_id' => ['nullable', 'uuid', Rule::exists('employees', 'id')],
            'payment_type_id' => ['nullable', 'uuid', Rule::exists('payment_types', 'id')],
            'payment_status_id' => ['nullable', 'uuid', Rule::exists('payment_statuses', 'id')],
            'currency' => ['nullable', 'string', 'size:3'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'sort_by' => ['nullable', 'string', Rule::in([
                'payment_number', 'amount', 'currency', 'payment_date', 'created_at', 'updated_at',
            ])],
            'sort_direction' => ['nullable', 'string', Rule::in(['asc', 'desc'])],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
            'trashed' => ['nullable', 'string', Rule::in(['with', 'only', 'without'])],
        ];
    }

    public function filters(): array
    {
        return [
            'search' => $this->input('search'),
            'employee_id' => $this->input('employee_id'),
            'payment_type_id' => $this->input('payment_type_id'),
            'payment_status_id' => $this->input('payment_status_id'),
            'currency' => $this->input('currency'),
            'date_from' => $this->input('date_from'),
            'date_to' => $this->input('date_to'),
            'sort_by' => $this->input('sort_by', 'created_at'),
            'sort_direction' => $this->input('sort_direction', 'desc'),
            'per_page' => (int) $this->input('per_page', 15),
            'page' => (int) $this->input('page', 1),
            'trashed' => $this->input('trashed', 'without'),
        ];
    }
}
