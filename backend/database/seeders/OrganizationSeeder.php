<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Employee;
use App\Models\EmployeeStatus;
use App\Models\ExchangeRate;
use App\Models\JobTitle;
use App\Models\User;
use Illuminate\Database\Seeder;

class OrganizationSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            ['name' => 'Executive', 'code' => 'EXEC', 'description' => 'Executive leadership'],
            ['name' => 'Human Resources', 'code' => 'HR', 'description' => 'HR and people operations'],
            ['name' => 'Finance', 'code' => 'FIN', 'description' => 'Financial management'],
            ['name' => 'Engineering', 'code' => 'ENG', 'description' => 'Product engineering'],
            ['name' => 'Marketing', 'code' => 'MKT', 'description' => 'Marketing and growth'],
            ['name' => 'Sales', 'code' => 'SALES', 'description' => 'Sales operations'],
        ];

        foreach ($departments as $dept) {
            Department::firstOrCreate(['code' => $dept['code']], $dept);
        }

        $engineering = Department::where('code', 'ENG')->first();
        $marketing = Department::where('code', 'MKT')->first();

        $jobTitles = [
            ['name' => 'Chief Executive Officer', 'code' => 'CEO', 'department_id' => Department::where('code', 'EXEC')->value('id')],
            ['name' => 'HR Manager', 'code' => 'HR_MGR', 'department_id' => Department::where('code', 'HR')->value('id')],
            ['name' => 'Software Engineer', 'code' => 'SWE', 'department_id' => $engineering?->id],
            ['name' => 'Senior Software Engineer', 'code' => 'SSE', 'department_id' => $engineering?->id],
            ['name' => 'Marketing Manager', 'code' => 'MKT_MGR', 'department_id' => $marketing?->id],
            ['name' => 'Account Executive', 'code' => 'AE', 'department_id' => Department::where('code', 'SALES')->value('id')],
        ];

        foreach ($jobTitles as $title) {
            JobTitle::firstOrCreate(['code' => $title['code']], $title);
        }

        ExchangeRate::firstOrCreate(
            ['from_currency' => 'USD', 'to_currency' => 'EUR', 'effective_date' => now()->toDateString()],
            ['rate' => 0.920000]
        );

        ExchangeRate::firstOrCreate(
            ['from_currency' => 'USD', 'to_currency' => 'GBP', 'effective_date' => now()->toDateString()],
            ['rate' => 0.790000]
        );

        $activeStatus = EmployeeStatus::where('code', 'active')->first();

        if ($activeStatus) {
            $admin = User::where('email', 'admin@example.com')->first();

            if ($admin && ! $admin->employee) {
                Employee::firstOrCreate(
                    ['email' => $admin->email],
                    [
                        'user_id' => $admin->id,
                        'employee_number' => 'EMP-0001',
                        'first_name' => 'System',
                        'last_name' => 'Administrator',
                        'phone' => $admin->phone,
                        'department_id' => Department::where('code', 'EXEC')->value('id'),
                        'job_title_id' => JobTitle::where('code', 'CEO')->value('id'),
                        'employee_status_id' => $activeStatus->id,
                        'hire_date' => now()->subYears(2)->toDateString(),
                    ]
                );
            }

            $employeeUser = User::firstOrCreate(
                ['email' => 'employee@example.com'],
                [
                    'name' => 'Ahmed Al-Rashid',
                    'password' => 'password',
                    'email_verified_at' => now(),
                    'status' => \App\Enums\UserStatus::Active,
                ]
            );
            $employeeUser->syncRoles(['employee']);

            Employee::firstOrCreate(
                ['email' => $employeeUser->email],
                [
                    'user_id' => $employeeUser->id,
                    'employee_number' => 'EMP-1001',
                    'first_name' => 'Ahmed',
                    'last_name' => 'Al-Rashid',
                    'phone' => '+966500000001',
                    'department_id' => $engineering?->id,
                    'job_title_id' => JobTitle::where('code', 'SWE')->value('id'),
                    'employee_status_id' => $activeStatus->id,
                    'hire_date' => now()->subYear()->toDateString(),
                ]
            );
        }
    }
}
