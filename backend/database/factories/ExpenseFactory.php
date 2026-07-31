<?php

namespace Database\Factories;

use App\Models\AdvertisingPlatform;
use App\Models\Department;
use App\Models\Employee;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ExpenseFactory extends Factory
{
    protected $model = Expense::class;

    public function definition(): array
    {
        return [
            'expense_number' => 'EXP-'.fake()->unique()->numerify('######'),
            'category_id' => ExpenseCategory::inRandomOrder()->value('id'),
            'platform_id' => fake()->optional(0.4)->passthrough(AdvertisingPlatform::inRandomOrder()->value('id')),
            'employee_id' => Employee::inRandomOrder()->value('id'),
            'department_id' => Department::inRandomOrder()->value('id'),
            'amount' => fake()->randomFloat(2, 10, 5000),
            'currency' => 'USD',
            'expense_date' => fake()->dateTimeBetween('-1 year', 'now'),
            'description' => fake()->sentence(),
            'receipt_path' => null,
            'approved_by' => fake()->optional(0.5)->passthrough(User::inRandomOrder()->value('id')),
            'approved_at' => fake()->optional(0.5)->dateTimeBetween('-1 year', 'now'),
            'created_by' => User::inRandomOrder()->value('id'),
        ];
    }
}
