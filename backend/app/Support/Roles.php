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

    /** @param  iterable<string>  $roles */
    public static function forDisplay(iterable $roles): array
    {
        return collect($roles)
            ->map(fn (string $role) => $role === 'user' ? 'employee' : $role)
            ->filter(fn (string $role) => self::isAssignable($role))
            ->unique()
            ->values()
            ->all();
    }
}
