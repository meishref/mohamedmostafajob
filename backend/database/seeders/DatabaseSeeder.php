<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleAndPermissionSeeder::class,
            LookupTableSeeder::class,
        ]);

        $admin = User::factory()->create([
            'name' => 'System Administrator',
            'email' => 'admin@example.com',
        ]);
        $admin->assignRole('admin');

        $this->call([
            OrganizationSeeder::class,
            BusinessDataSeeder::class,
        ]);
    }
}
