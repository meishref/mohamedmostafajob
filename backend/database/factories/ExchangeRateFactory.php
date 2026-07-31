<?php

namespace Database\Factories;

use App\Models\ExchangeRate;
use Illuminate\Database\Eloquent\Factories\Factory;

class ExchangeRateFactory extends Factory
{
    protected $model = ExchangeRate::class;

    public function definition(): array
    {
        return [
            'from_currency' => 'USD',
            'to_currency' => fake()->randomElement(['EUR', 'GBP', 'JPY', 'CAD']),
            'rate' => fake()->randomFloat(6, 0.5, 2.0),
            'effective_date' => fake()->dateTimeBetween('-1 year', 'now'),
        ];
    }
}
