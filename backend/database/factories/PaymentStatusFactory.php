<?php

namespace Database\Factories;

use App\Models\PaymentStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

class PaymentStatusFactory extends Factory
{
    protected $model = PaymentStatus::class;

    public function definition(): array
    {
        return [
            'name' => fake()->word(),
            'code' => fake()->unique()->slug(2),
            'color' => fake()->hexColor(),
            'is_final' => false,
        ];
    }
}
