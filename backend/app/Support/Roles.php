<?php

namespace App\Support;

class Roles
{
    /** @return list<string> */
    public static function assignable(): array
    {
        return config('roles.assignable', ['admin', 'employee']);
    }

    public static function isAssignable(string $role): bool
    {
        return in_array($role, self::assignable(), true);
    }
}
