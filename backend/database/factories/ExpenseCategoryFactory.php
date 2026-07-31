<?php

namespace Database\Factories;

use App\Models\ExpenseCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

class ExpenseCategoryFactory extends Factory
{
    protected $model = ExpenseCategory::class;

    public function definition(): array
    {
        return [
            'name' => fake()->words(2, true),
            'code' => fake()->unique()->slug(2),
            'description' => fake()->sentence(),
            'is_active' => true,
        ];
    }
}
