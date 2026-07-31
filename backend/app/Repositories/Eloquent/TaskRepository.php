<?php

namespace App\Repositories\Eloquent;

use App\Models\Task;
use App\Repositories\Contracts\TaskRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class TaskRepository implements TaskRepositoryInterface
{
    public function findById(string $id): ?Task
    {
        return Task::query()->find($id);
    }

    public function findByIdWithTrashed(string $id): ?Task
    {
        return Task::query()->withTrashed()->find($id);
    }

    public function create(array $data): Task
    {
        return Task::query()->create($data);
    }

    public function update(Task $task, array $data): Task
    {
        $task->update($data);

        return $task->fresh();
    }

    public function delete(Task $task): bool
    {
        return (bool) $task->delete();
    }

    public function restore(Task $task): bool
    {
        return (bool) $task->restore();
    }

    public function paginate(array $filters): LengthAwarePaginator
    {
        $query = Task::query()->with([
            'assignee.department',
            'assignee.jobTitle',
            'assignee.employeeStatus',
            'taskStatus',
            'priority',
            'creator',
        ]);

        if ($filters['trashed'] === 'only') {
            $query->onlyTrashed();
        } elseif ($filters['trashed'] === 'with') {
            $query->withTrashed();
        }

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('notes', 'like', "%{$search}%");
            });
        }

        if (! empty($filters['assigned_to'])) {
            $query->where('assigned_to', $filters['assigned_to']);
        }

        if (! empty($filters['task_status_id'])) {
            $query->where('task_status_id', $filters['task_status_id']);
        }

        if (! empty($filters['priority_id'])) {
            $query->where('priority_id', $filters['priority_id']);
        }

        if (! empty($filters['department_id'])) {
            $query->where('department_id', $filters['department_id']);
        }

        if (! empty($filters['date_from'])) {
            $query->whereDate('due_date', '>=', $filters['date_from']);
        }

        if (! empty($filters['date_to'])) {
            $query->whereDate('due_date', '<=', $filters['date_to']);
        }

        $sortField = $filters['sort_by'] ?? 'created_at';
        $sortDirection = $filters['sort_direction'] ?? 'desc';
        $allowedSorts = ['title', 'due_date', 'start_date', 'created_at', 'updated_at'];

        if (in_array($sortField, $allowedSorts, true)) {
            $query->orderBy($sortField, $sortDirection);
        }

        return $query->paginate(
            perPage: $filters['per_page'] ?? 15,
            page: $filters['page'] ?? 1,
        );
    }
}
