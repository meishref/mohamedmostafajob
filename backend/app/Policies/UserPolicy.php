<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('users.view');
    }

    public function view(User $user, User $model): bool
    {
        return $user->can('users.view');
    }

    public function create(User $user): bool
    {
        return $user->can('users.create');
    }

    public function update(User $user, User $model): bool
    {
        return $user->can('users.update');
    }

    public function delete(User $user, User $model): bool
    {
        if ($user->id === $model->id) {
            return false;
        }

        return $user->can('users.delete');
    }

    public function restore(User $user, User $model): bool
    {
        return $user->can('users.restore');
    }

    public function forceDelete(User $user, User $model): bool
    {
        if ($user->id === $model->id) {
            return false;
        }

        return $user->can('users.delete');
    }

    public function suspend(User $user, User $model): bool
    {
        if ($user->id === $model->id) {
            return false;
        }

        return $user->can('users.suspend');
    }

    public function resetPassword(User $user, User $model): bool
    {
        return $user->can('users.reset-password');
    }

    public function assignRole(User $user, User $model): bool
    {
        return $user->can('users.update');
    }
}
