<?php

namespace Database\Factories;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ActivityLogFactory extends Factory
{
    protected $model = ActivityLog::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'subject_type' => null,
            'subject_id' => null,
            'action' => fake()->randomElement(['created', 'updated', 'deleted', 'viewed', 'login']),
            'description' => fake()->sentence(),
            'properties' => ['ip' => fake()->ipv4()],
            'ip_address' => fake()->ipv4(),
            'user_agent' => fake()->userAgent(),
        ];
    }
}
