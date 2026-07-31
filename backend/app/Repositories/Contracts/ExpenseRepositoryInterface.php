<?php

namespace App\Repositories\Contracts;

use App\Models\Expense;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface ExpenseRepositoryInterface
{
    public function findById(string $id): ?Expense;

    public function findByIdWithTrashed(string $id): ?Expense;

    public function create(array $data): Expense;

    public function update(Expense $expense, array $data): Expense;

    public function delete(Expense $expense): bool;

    public function restore(Expense $expense): bool;

    public function paginate(array $filters): LengthAwarePaginator;
}
