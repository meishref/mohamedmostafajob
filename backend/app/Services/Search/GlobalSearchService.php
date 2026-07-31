<?php

namespace App\Services\Search;

use App\Models\Employee;
use App\Models\Expense;
use App\Models\Payment;
use App\Models\Task;
use App\Models\User;
use Illuminate\Support\Collection;

class GlobalSearchService
{
    private const LIMIT = 8;

    /** @return array<string, mixed> */
    public function search(User $user, string $query): array
    {
        $term = trim($query);

        if ($term === '') {
            return ['results' => [], 'total' => 0];
        }

        $results = collect();

        if ($user->can('employees.view')) {
            $results = $results->merge($this->searchEmployees($term));
        }

        if ($user->can('tasks.view')) {
            $results = $results->merge($this->searchTasks($term));
        }

        if ($user->can('payments.view')) {
            $results = $results->merge($this->searchPayments($term));
        }

        if ($user->can('expenses.view')) {
            $results = $results->merge($this->searchExpenses($term));
        }

        return [
            'results' => $results->sortByDesc('created_at')->take(20)->values()->all(),
            'total' => $results->count(),
        ];
    }

    /** @return Collection<int, array<string, mixed>> */
    private function searchEmployees(string $term): Collection
    {
        return Employee::query()
            ->with(['department', 'employeeStatus'])
            ->where(function ($q) use ($term) {
                $q->where('first_name', 'like', "%{$term}%")
                    ->orWhere('last_name', 'like', "%{$term}%")
                    ->orWhere('email', 'like', "%{$term}%")
                    ->orWhere('employee_number', 'like', "%{$term}%")
                    ->orWhere('phone', 'like', "%{$term}%");
            })
            ->latest()
            ->limit(self::LIMIT)
            ->get()
            ->map(fn (Employee $e) => [
                'type' => 'employee',
                'id' => $e->id,
                'title' => $e->full_name,
                'subtitle' => $e->employee_number.($e->department ? ' · '.$e->department->name : ''),
                'status' => $e->employeeStatus?->name,
                'status_color' => $e->employeeStatus?->color,
                'url' => '/employees/'.$e->id,
                'created_at' => $e->created_at?->toISOString(),
            ]);
    }

    /** @return Collection<int, array<string, mixed>> */
    private function searchTasks(string $term): Collection
    {
        return Task::query()
            ->with(['taskStatus', 'assignee'])
            ->where(function ($q) use ($term) {
                $q->where('title', 'like', "%{$term}%")
                    ->orWhere('description', 'like', "%{$term}%")
                    ->orWhere('notes', 'like', "%{$term}%");
            })
            ->latest()
            ->limit(self::LIMIT)
            ->get()
            ->map(fn (Task $t) => [
                'type' => 'task',
                'id' => $t->id,
                'title' => $t->title,
                'subtitle' => ($t->assignee?->full_name ? 'Assigned: '.$t->assignee->full_name : 'Unassigned'),
                'status' => $t->taskStatus?->name,
                'status_color' => $t->taskStatus?->color,
                'url' => '/tasks/'.$t->id,
                'created_at' => $t->created_at?->toISOString(),
            ]);
    }

    /** @return Collection<int, array<string, mixed>> */
    private function searchPayments(string $term): Collection
    {
        return Payment::query()
            ->with(['employee', 'paymentStatus'])
            ->where(function ($q) use ($term) {
                $q->where('payment_number', 'like', "%{$term}%")
                    ->orWhere('reference', 'like', "%{$term}%")
                    ->orWhere('notes', 'like', "%{$term}%")
                    ->orWhere('currency', 'like', "%{$term}%");
            })
            ->latest()
            ->limit(self::LIMIT)
            ->get()
            ->map(fn (Payment $p) => [
                'type' => 'payment',
                'id' => $p->id,
                'title' => $p->payment_number,
                'subtitle' => $p->currency.' '.$p->amount.($p->employee ? ' · '.$p->employee->full_name : ''),
                'status' => $p->paymentStatus?->name,
                'status_color' => $p->paymentStatus?->color,
                'url' => '/payments/'.$p->id,
                'created_at' => $p->created_at?->toISOString(),
            ]);
    }

    /** @return Collection<int, array<string, mixed>> */
    private function searchExpenses(string $term): Collection
    {
        return Expense::query()
            ->with(['category'])
            ->where(function ($q) use ($term) {
                $q->where('expense_number', 'like', "%{$term}%")
                    ->orWhere('description', 'like', "%{$term}%")
                    ->orWhere('currency', 'like', "%{$term}%");
            })
            ->latest()
            ->limit(self::LIMIT)
            ->get()
            ->map(fn (Expense $e) => [
                'type' => 'expense',
                'id' => $e->id,
                'title' => $e->expense_number,
                'subtitle' => $e->currency.' '.$e->amount.($e->category ? ' · '.$e->category->name : ''),
                'status' => $e->category?->name,
                'status_color' => null,
                'url' => '/expenses/'.$e->id,
                'created_at' => $e->created_at?->toISOString(),
            ]);
    }
}
