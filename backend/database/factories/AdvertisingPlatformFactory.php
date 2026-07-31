<?php

namespace Database\Factories;

use App\Models\AdvertisingPlatform;
use Illuminate\Database\Eloquent\Factories\Factory;

class AdvertisingPlatformFactory extends Factory
{
    protected $model = AdvertisingPlatform::class;

    public function definition(): array
    {
        return [
            'name' => fake()->company(),
            'code' => fake()->unique()->slug(2),
            'website' => fake()->url(),
            'is_active' => true,
        ];
    }
}
