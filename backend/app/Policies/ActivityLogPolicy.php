<?php

namespace App\Policies;

use App\Models\User;

class ActivityLogPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('activity-logs.view');
    }

    public function view(User $user): bool
    {
        return $user->can('activity-logs.view');
    }
}
