<?php

namespace Database\Factories;

use App\Models\PaymentType;
use Illuminate\Database\Eloquent\Factories\Factory;

class PaymentTypeFactory extends Factory
{
    protected $model = PaymentType::class;

    public function definition(): array
    {
        return [
            'name' => fake()->word(),
            'code' => fake()->unique()->slug(2),
            'description' => fake()->sentence(),
            'is_active' => true,
        ];
    }
}
