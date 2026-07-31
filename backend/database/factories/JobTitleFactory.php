<?php

namespace Database\Factories;

use App\Models\Department;
use App\Models\JobTitle;
use Illuminate\Database\Eloquent\Factories\Factory;

class JobTitleFactory extends Factory
{
    protected $model = JobTitle::class;

    public function definition(): array
    {
        $title = fake()->jobTitle();

        return [
            'name' => $title,
            'code' => strtoupper(substr(str_replace(' ', '_', $title), 0, 15)).fake()->unique()->numberBetween(1, 99),
            'description' => fake()->sentence(),
            'department_id' => Department::inRandomOrder()->value('id'),
            'is_active' => true,
        ];
    }
}
