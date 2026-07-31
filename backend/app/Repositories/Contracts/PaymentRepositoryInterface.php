<?php

namespace App\Repositories\Contracts;

use App\Models\Payment;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface PaymentRepositoryInterface
{
    public function findById(string $id): ?Payment;

    public function findByIdWithTrashed(string $id): ?Payment;

    public function create(array $data): Payment;

    public function update(Payment $payment, array $data): Payment;

    public function delete(Payment $payment): bool;

    public function restore(Payment $payment): bool;

    public function paginate(array $filters): LengthAwarePaginator;
}
