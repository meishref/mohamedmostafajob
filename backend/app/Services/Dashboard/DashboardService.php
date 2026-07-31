<?php

namespace App\Services\Dashboard;

use App\Models\ActivityLog;
use App\Models\Department;
use App\Models\Employee;
use App\Models\Expense;
use App\Models\Payment;
use App\Models\Task;
use App\Models\TaskStatus;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    /** @return array<string, mixed> */
    public function getData(): array
    {
        return [
            'statistics' => $this->statistics(),
            'charts' => $this->charts(),
            'recent' => $this->recent(),
        ];
    }

    /** @return array<string, int> */
    private function statistics(): array
    {
        return [
            'total_employees' => Employee::query()->count(),
            'total_departments' => Department::query()->count(),
            'total_tasks' => Task::query()->count(),
            'total_payments' => Payment::query()->count(),
            'total_expenses' => Expense::query()->count(),
        ];
    }

    /** @return array<string, mixed> */
    private function charts(): array
    {
        return [
            'monthly_expenses' => $this->monthlyTotals(Expense::query(), 'expense_date'),
            'monthly_payments' => $this->monthlyTotals(Payment::query(), 'payment_date'),
            'tasks_by_status' => TaskStatus::query()
                ->withCount(['tasks' => fn ($q) => $q->whereNull('deleted_at')])
                ->orderBy('sort_order')
                ->get()
                ->map(fn (TaskStatus $status) => [
                    'id' => $status->id,
                    'name' => $status->name,
                    'code' => $status->code,
                    'color' => $status->color,
                    'count' => $status->tasks_count,
                ])
                ->values()
                ->all(),
            'employees_by_department' => Department::query()
                ->withCount(['employees' => fn ($q) => $q->whereNull('deleted_at')])
                ->orderBy('name')
                ->get()
                ->map(fn (Department $dept) => [
                    'id' => $dept->id,
                    'name' => $dept->name,
                    'count' => $dept->employees_count,
                ])
                ->values()
                ->all(),
        ];
    }

    /**
     * @param  \Illuminate\Database\Eloquent\Builder<\Illuminate\Database\Eloquent\Model>  $query
     * @return array<int, array{month: string, label: string, total: float}>
     */
    private function monthlyTotals($query, string $dateColumn): array
    {
        $start = now()->subMonths(11)->startOfMonth();

        $rows = (clone $query)
            ->whereNull('deleted_at')
            ->where($dateColumn, '>=', $start)
            ->select([
                DB::raw("DATE_FORMAT({$dateColumn}, '%Y-%m') as month"),
                DB::raw('SUM(amount) as total'),
            ])
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        $months = [];
        for ($i = 0; $i < 12; $i++) {
            $date = $start->copy()->addMonths($i);
            $key = $date->format('Y-m');
            $months[] = [
                'month' => $key,
                'label' => $date->format('M Y'),
                'total' => round((float) ($rows[$key]->total ?? 0), 2),
            ];
        }

        return $months;
    }

    /** @return array<string, mixed> */
    private function recent(): array
    {
        return [
            'employees' => Employee::query()
                ->with(['department', 'employeeStatus'])
                ->latest()
                ->limit(5)
                ->get()
                ->map(fn (Employee $e) => [
                    'id' => $e->id,
                    'full_name' => $e->full_name,
                    'employee_number' => $e->employee_number,
                    'email' => $e->email,
                    'department' => $e->department?->name,
                    'status' => $e->employeeStatus?->name,
                    'created_at' => $e->created_at?->toISOString(),
                ]),
            'tasks' => Task::query()
                ->with(['taskStatus', 'priority', 'assignee'])
                ->latest()
                ->limit(5)
                ->get()
                ->map(fn (Task $t) => [
                    'id' => $t->id,
                    'title' => $t->title,
                    'status' => $t->taskStatus?->name,
                    'status_color' => $t->taskStatus?->color,
                    'priority' => $t->priority?->name,
                    'assignee' => $t->assignee?->full_name,
                    'due_date' => $t->due_date?->format('Y-m-d'),
                    'created_at' => $t->created_at?->toISOString(),
                ]),
            'payments' => Payment::query()
                ->with(['employee', 'paymentStatus', 'paymentType'])
                ->latest()
                ->limit(5)
                ->get()
                ->map(fn (Payment $p) => [
                    'id' => $p->id,
                    'payment_number' => $p->payment_number,
                    'employee' => $p->employee?->full_name,
                    'amount' => $p->amount,
                    'currency' => $p->currency,
                    'payment_date' => $p->payment_date?->format('Y-m-d'),
                    'status' => $p->paymentStatus?->name,
                    'status_color' => $p->paymentStatus?->color,
                    'type' => $p->paymentType?->name,
                    'created_at' => $p->created_at?->toISOString(),
                ]),
            'expenses' => Expense::query()
                ->with(['category', 'platform'])
                ->latest()
                ->limit(5)
                ->get()
                ->map(fn (Expense $e) => [
                    'id' => $e->id,
                    'expense_number' => $e->expense_number,
                    'category' => $e->category?->name,
                    'platform' => $e->platform?->name,
                    'amount' => $e->amount,
                    'currency' => $e->currency,
                    'expense_date' => $e->expense_date?->format('Y-m-d'),
                    'created_at' => $e->created_at?->toISOString(),
                ]),
            'activities' => ActivityLog::query()
                ->with('user')
                ->latest()
                ->limit(10)
                ->get()
                ->map(fn (ActivityLog $log) => [
                    'id' => $log->id,
                    'action' => $log->action,
                    'module' => $log->module,
                    'description' => $log->description,
                    'user' => $log->user?->name,
                    'browser' => $log->browser,
                    'operating_system' => $log->operating_system,
                    'subject_type' => $log->subject_type ? class_basename($log->subject_type) : null,
                    'created_at' => $log->created_at?->toISOString(),
                ]),
        ];
    }
}
