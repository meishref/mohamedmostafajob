<?php

namespace Database\Factories;

use App\Models\EmployeeStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

class EmployeeStatusFactory extends Factory
{
    protected $model = EmployeeStatus::class;

    public function definition(): array
    {
        return [
            'name' => fake()->word(),
            'code' => fake()->unique()->slug(2),
            'color' => fake()->hexColor(),
            'is_active' => true,
            'sort_order' => fake()->numberBetween(1, 10),
        ];
    }
}
