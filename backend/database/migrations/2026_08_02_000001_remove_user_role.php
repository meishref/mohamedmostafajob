<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

return new class extends Migration
{
    public function up(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $userRole = Role::query()->where('name', 'user')->where('guard_name', 'web')->first();
        $employeeRole = Role::query()->where('name', 'employee')->where('guard_name', 'web')->first();

        if (! $userRole || ! $employeeRole) {
            return;
        }

        $assignments = DB::table('model_has_roles')
            ->where('role_id', $userRole->id)
            ->get();

        foreach ($assignments as $assignment) {
            $alreadyEmployee = DB::table('model_has_roles')
                ->where('model_type', $assignment->model_type)
                ->where('model_id', $assignment->model_id)
                ->where('role_id', $employeeRole->id)
                ->exists();

            if (! $alreadyEmployee) {
                DB::table('model_has_roles')->insert([
                    'role_id' => $employeeRole->id,
                    'model_type' => $assignment->model_type,
                    'model_id' => $assignment->model_id,
                ]);
            }
        }

        DB::table('model_has_roles')->where('role_id', $userRole->id)->delete();
        DB::table('role_has_permissions')->where('role_id', $userRole->id)->delete();
        $userRole->delete();
    }

    public function down(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        Role::firstOrCreate(['name' => 'user', 'guard_name' => 'web']);
    }
};
