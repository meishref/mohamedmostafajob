<?php

namespace Database\Factories;

use App\Models\Department;
use Illuminate\Database\Eloquent\Factories\Factory;

class DepartmentFactory extends Factory
{
    protected $model = Department::class;
    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);

        return [
            'name' => ucwords($name),
            'code' => strtoupper(substr(str_replace(' ', '_', $name), 0, 10)).fake()->unique()->numberBetween(1, 999),
            'description' => fake()->sentence(),
            'is_active' => true,
        ];
    }
}
