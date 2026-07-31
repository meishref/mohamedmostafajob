<?php

namespace Database\Factories;

use App\Models\TaskStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

class TaskStatusFactory extends Factory
{
    protected $model = TaskStatus::class;

    public function definition(): array
    {
        return [
            'name' => fake()->word(),
            'code' => fake()->unique()->slug(2),
            'color' => fake()->hexColor(),
            'sort_order' => fake()->numberBetween(1, 10),
            'is_default' => false,
            'is_closed' => false,
        ];
    }
}
