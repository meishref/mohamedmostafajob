<?php

namespace App\Repositories\Eloquent;

use App\Models\Expense;
use App\Repositories\Contracts\ExpenseRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ExpenseRepository implements ExpenseRepositoryInterface
{
    public function findById(string $id): ?Expense
    {
        return Expense::query()->find($id);
    }

    public function findByIdWithTrashed(string $id): ?Expense
    {
        return Expense::query()->withTrashed()->find($id);
    }

    public function create(array $data): Expense
    {
        return Expense::query()->create($data);
    }

    public function update(Expense $expense, array $data): Expense
    {
        $expense->update($data);

        return $expense->fresh();
    }

    public function delete(Expense $expense): bool
    {
        return (bool) $expense->delete();
    }

    public function restore(Expense $expense): bool
    {
        return (bool) $expense->restore();
    }

    public function paginate(array $filters): LengthAwarePaginator
    {
        $query = Expense::query()->with(['category', 'platform', 'creator']);

        if ($filters['trashed'] === 'only') {
            $query->onlyTrashed();
        } elseif ($filters['trashed'] === 'with') {
            $query->withTrashed();
        }

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('expense_number', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('currency', 'like', "%{$search}%");
            });
        }

        if (! empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (! empty($filters['platform_id'])) {
            $query->where('platform_id', $filters['platform_id']);
        }

        if (! empty($filters['currency'])) {
            $query->where('currency', strtoupper($filters['currency']));
        }

        if (! empty($filters['date_from'])) {
            $query->whereDate('expense_date', '>=', $filters['date_from']);
        }

        if (! empty($filters['date_to'])) {
            $query->whereDate('expense_date', '<=', $filters['date_to']);
        }

        $sortField = $filters['sort_by'] ?? 'created_at';
        $sortDirection = $filters['sort_direction'] ?? 'desc';
        $allowedSorts = ['expense_number', 'amount', 'currency', 'expense_date', 'created_at', 'updated_at'];

        if (in_array($sortField, $allowedSorts, true)) {
            $query->orderBy($sortField, $sortDirection);
        }

        return $query->paginate(
            perPage: $filters['per_page'] ?? 15,
            page: $filters['page'] ?? 1,
        );
    }
}
