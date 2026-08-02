<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    protected function isAdmin(User $user): bool
    {
        return $user->hasRole('admin');
    }

    public function viewAny(User $user): bool
    {
        return $this->isAdmin($user) || $user->can('users.view');
    }

    public function view(User $user, User $model): bool
    {
        return $this->isAdmin($user) || $user->can('users.view');
    }

    public function create(User $user): bool
    {
        return $this->isAdmin($user) || $user->can('users.create');
    }

    public function update(User $user, User $model): bool
    {
        return $this->isAdmin($user) || $user->can('users.update');
    }

    public function delete(User $user, User $model): bool
    {
        if ($user->id === $model->id) {
            return false;
        }

        return $this->isAdmin($user) || $user->can('users.delete');
    }

    public function restore(User $user, User $model): bool
    {
        return $this->isAdmin($user) || $user->can('users.restore');
    }

    public function forceDelete(User $user, User $model): bool
    {
        if ($user->id === $model->id) {
            return false;
        }

        return $this->isAdmin($user) || $user->can('users.delete');
    }

    public function suspend(User $user, User $model): bool
    {
        if ($user->id === $model->id) {
            return false;
        }

        return $this->isAdmin($user) || $user->can('users.suspend');
    }

    public function resetPassword(User $user, User $model): bool
    {
        return $this->isAdmin($user) || $user->can('users.reset-password');
    }

    public function assignRole(User $user, User $model): bool
    {
        return $this->isAdmin($user) || $user->can('users.update');
    }
}
