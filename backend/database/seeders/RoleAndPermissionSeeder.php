<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleAndPermissionSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'users.view',
            'users.create',
            'users.update',
            'users.delete',
            'users.suspend',
            'users.reset-password',
            'users.restore',
            'settings.view',
            'settings.manage',
            'employees.view',
            'employees.create',
            'employees.update',
            'employees.delete',
            'employees.restore',
            'tasks.view',
            'tasks.view-own',
            'tasks.create',
            'tasks.update',
            'tasks.update-status',
            'tasks.comment',
            'tasks.delete',
            'tasks.restore',
            'expenses.view',
            'expenses.create',
            'expenses.update',
            'expenses.delete',
            'expenses.restore',
            'payments.view',
            'payments.create',
            'payments.update',
            'payments.delete',
            'payments.restore',
            'activity-logs.view',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $employeeRole = Role::firstOrCreate(['name' => 'employee', 'guard_name' => 'web']);

        $adminRole->syncPermissions(Permission::all());
        $employeeRole->syncPermissions([
            'tasks.view-own',
            'tasks.update-status',
            'tasks.comment',
        ]);
    }
}
