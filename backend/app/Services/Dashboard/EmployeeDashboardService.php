<?php

namespace App\Services\Dashboard;

use App\Models\Task;
use App\Models\TaskStatus;
use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Support\Collection;

class EmployeeDashboardService
{
    public function getDashboard(User $user): array
    {
        $employee = $user->employee;

        if (! $employee) {
            return [
                'employee' => null,
                'statistics' => [
                    'my_tasks' => 0,
                    'new_tasks' => 0,
                    'in_progress_tasks' => 0,
                    'completed_tasks' => 0,
                    'overdue_tasks' => 0,
                    'due_today_tasks' => 0,
                    'upcoming_tasks' => 0,
                ],
                'tasks' => [
                    'due_today' => [],
                    'overdue' => [],
                    'upcoming' => [],
                    'recent' => [],
                ],
                'notifications' => [],
            ];
        }

        $base = Task::query()
            ->with(['taskStatus', 'priority', 'creator'])
            ->where('assigned_to', $employee->id);

        $closedStatusIds = TaskStatus::query()->where('is_closed', true)->pluck('id');
        $todoCodes = ['todo', 'not_started', 'not-started'];
        $inProgressCodes = ['in_progress', 'in-progress', 'review', 'under_review', 'under-review'];

        $todoStatusIds = TaskStatus::query()->whereIn('code', $todoCodes)->pluck('id');
        $inProgressStatusIds = TaskStatus::query()->whereIn('code', $inProgressCodes)->pluck('id');

        $today = now()->toDateString();

        $myTasks = (clone $base)->count();
        $newTasks = (clone $base)->whereIn('task_status_id', $todoStatusIds)->count();
        $inProgressTasks = (clone $base)->whereIn('task_status_id', $inProgressStatusIds)->count();
        $completedTasks = (clone $base)->whereIn('task_status_id', $closedStatusIds)->count();
        $overdueTasks = (clone $base)
            ->whereNotIn('task_status_id', $closedStatusIds)
            ->whereDate('due_date', '<', $today)
            ->count();
        $dueTodayTasks = (clone $base)
            ->whereNotIn('task_status_id', $closedStatusIds)
            ->whereDate('due_date', $today)
            ->count();
        $upcomingTasks = (clone $base)
            ->whereNotIn('task_status_id', $closedStatusIds)
            ->whereDate('due_date', '>', $today)
            ->count();

        return [
            'employee' => [
                'id' => $employee->id,
                'full_name' => $employee->full_name,
                'employee_number' => $employee->employee_number,
            ],
            'statistics' => [
                'my_tasks' => $myTasks,
                'new_tasks' => $newTasks,
                'in_progress_tasks' => $inProgressTasks,
                'completed_tasks' => $completedTasks,
                'overdue_tasks' => $overdueTasks,
                'due_today_tasks' => $dueTodayTasks,
                'upcoming_tasks' => $upcomingTasks,
            ],
            'tasks' => [
                'due_today' => $this->mapTasks(
                    (clone $base)
                        ->whereNotIn('task_status_id', $closedStatusIds)
                        ->whereDate('due_date', $today)
                        ->orderBy('priority_id')
                        ->limit(8)
                        ->get()
                ),
                'overdue' => $this->mapTasks(
                    (clone $base)
                        ->whereNotIn('task_status_id', $closedStatusIds)
                        ->whereDate('due_date', '<', $today)
                        ->orderBy('due_date')
                        ->limit(8)
                        ->get()
                ),
                'upcoming' => $this->mapTasks(
                    (clone $base)
                        ->whereNotIn('task_status_id', $closedStatusIds)
                        ->whereDate('due_date', '>', $today)
                        ->orderBy('due_date')
                        ->limit(8)
                        ->get()
                ),
                'recent' => $this->mapTasks(
                    (clone $base)->orderByDesc('updated_at')->limit(8)->get()
                ),
            ],
            'notifications' => UserNotification::query()
                ->where('user_id', $user->id)
                ->latest()
                ->limit(8)
                ->get()
                ->map(fn (UserNotification $n) => [
                    'id' => $n->id,
                    'type' => $n->type,
                    'title' => $n->title,
                    'message' => $n->message,
                    'is_read' => (bool) $n->is_read,
                    'data' => $n->data,
                    'created_at' => $n->created_at?->toISOString(),
                ])
                ->values()
                ->all(),
        ];
    }

    private function mapTasks(Collection $tasks): array
    {
        return $tasks->map(fn (Task $task) => [
            'id' => $task->id,
            'title' => $task->title,
            'due_date' => $task->due_date?->format('Y-m-d'),
            'task_status' => $task->taskStatus ? [
                'id' => $task->taskStatus->id,
                'name' => $task->taskStatus->name,
                'code' => $task->taskStatus->code,
                'color' => $task->taskStatus->color,
            ] : null,
            'priority' => $task->priority ? [
                'id' => $task->priority->id,
                'name' => $task->priority->name,
                'code' => $task->priority->code,
                'color' => $task->priority->color,
            ] : null,
            'creator' => $task->creator ? [
                'id' => $task->creator->id,
                'name' => $task->creator->name,
            ] : null,
            'updated_at' => $task->updated_at?->toISOString(),
        ])->values()->all();
    }
}
