<?php

namespace App\Repositories\Eloquent;

use App\Models\Payment;
use App\Repositories\Contracts\PaymentRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class PaymentRepository implements PaymentRepositoryInterface
{
    public function findById(string $id): ?Payment
    {
        return Payment::query()->find($id);
    }

    public function findByIdWithTrashed(string $id): ?Payment
    {
        return Payment::query()->withTrashed()->find($id);
    }

    public function create(array $data): Payment
    {
        return Payment::query()->create($data);
    }

    public function update(Payment $payment, array $data): Payment
    {
        $payment->update($data);

        return $payment->fresh();
    }

    public function delete(Payment $payment): bool
    {
        return (bool) $payment->delete();
    }

    public function restore(Payment $payment): bool
    {
        return (bool) $payment->restore();
    }

    public function paginate(array $filters): LengthAwarePaginator
    {
        $query = Payment::query()->with(['employee', 'paymentType', 'paymentStatus', 'creator']);

        if ($filters['trashed'] === 'only') {
            $query->onlyTrashed();
        } elseif ($filters['trashed'] === 'with') {
            $query->withTrashed();
        }

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('payment_number', 'like', "%{$search}%")
                    ->orWhere('reference', 'like', "%{$search}%")
                    ->orWhere('notes', 'like', "%{$search}%")
                    ->orWhere('currency', 'like', "%{$search}%");
            });
        }

        if (! empty($filters['employee_id'])) {
            $query->where('employee_id', $filters['employee_id']);
        }

        if (! empty($filters['payment_type_id'])) {
            $query->where('payment_type_id', $filters['payment_type_id']);
        }

        if (! empty($filters['payment_status_id'])) {
            $query->where('payment_status_id', $filters['payment_status_id']);
        }

        if (! empty($filters['currency'])) {
            $query->where('currency', strtoupper($filters['currency']));
        }

        if (! empty($filters['date_from'])) {
            $query->whereDate('payment_date', '>=', $filters['date_from']);
        }

        if (! empty($filters['date_to'])) {
            $query->whereDate('payment_date', '<=', $filters['date_to']);
        }

        $sortField = $filters['sort_by'] ?? 'created_at';
        $sortDirection = $filters['sort_direction'] ?? 'desc';
        $allowedSorts = ['payment_number', 'amount', 'currency', 'payment_date', 'created_at', 'updated_at'];

        if (in_array($sortField, $allowedSorts, true)) {
            $query->orderBy($sortField, $sortDirection);
        }

        return $query->paginate(
            perPage: $filters['per_page'] ?? 15,
            page: $filters['page'] ?? 1,
        );
    }
}
