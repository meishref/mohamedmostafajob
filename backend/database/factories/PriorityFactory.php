<?php

namespace Database\Factories;

use App\Models\Priority;
use Illuminate\Database\Eloquent\Factories\Factory;

class PriorityFactory extends Factory
{
    protected $model = Priority::class;

    public function definition(): array
    {
        return [
            'name' => fake()->word(),
            'code' => fake()->unique()->slug(2),
            'level' => fake()->numberBetween(1, 5),
            'color' => fake()->hexColor(),
        ];
    }
}
