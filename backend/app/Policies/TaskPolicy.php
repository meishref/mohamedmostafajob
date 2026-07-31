<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;

class TaskPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('tasks.view') || $user->can('tasks.view-own');
    }

    public function view(User $user, Task $task): bool
    {
        if ($user->can('tasks.view')) {
            return true;
        }

        return $user->can('tasks.view-own') && $this->isAssignee($user, $task);
    }

    public function create(User $user): bool
    {
        return $user->can('tasks.create');
    }

    public function update(User $user, Task $task): bool
    {
        return $user->can('tasks.update');
    }

    public function updateStatus(User $user, Task $task): bool
    {
        if ($user->can('tasks.update')) {
            return true;
        }

        return $user->can('tasks.update-status') && $this->isAssignee($user, $task);
    }

    public function comment(User $user, Task $task): bool
    {
        if ($user->can('tasks.update') || $user->can('tasks.comment')) {
            if ($user->can('tasks.update')) {
                return true;
            }

            return $this->isAssignee($user, $task);
        }

        return false;
    }

    public function delete(User $user, Task $task): bool
    {
        return $user->can('tasks.delete');
    }

    public function restore(User $user, Task $task): bool
    {
        return $user->can('tasks.restore');
    }

    public function attachFiles(User $user, Task $task): bool
    {
        return $user->can('tasks.update');
    }

    private function isAssignee(User $user, Task $task): bool
    {
        $employeeId = $user->employee?->id;

        return $employeeId !== null && $task->assigned_to === $employeeId;
    }
}
