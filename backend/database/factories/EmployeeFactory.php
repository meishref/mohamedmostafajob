<?php

namespace Database\Factories;

use App\Models\Department;
use App\Models\Employee;
use App\Models\EmployeeStatus;
use App\Models\JobTitle;
use Illuminate\Database\Eloquent\Factories\Factory;

class EmployeeFactory extends Factory
{
    protected $model = Employee::class;

    public function definition(): array
    {
        return [
            'employee_number' => 'EMP-'.fake()->unique()->numerify('####'),
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'department_id' => Department::inRandomOrder()->value('id'),
            'job_title_id' => JobTitle::inRandomOrder()->value('id'),
            'employee_status_id' => EmployeeStatus::where('code', 'active')->value('id')
                ?? EmployeeStatus::inRandomOrder()->value('id'),
            'hire_date' => fake()->dateTimeBetween('-5 years', 'now'),
            'termination_date' => null,
        ];
    }
}
