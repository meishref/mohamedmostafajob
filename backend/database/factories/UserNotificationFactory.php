<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Database\Eloquent\Factories\Factory;

class UserNotificationFactory extends Factory
{
    protected $model = UserNotification::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'type' => fake()->randomElement(['info', 'warning', 'success', 'task', 'payment']),
            'title' => fake()->sentence(3),
            'message' => fake()->paragraph(),
            'data' => ['reference_id' => fake()->uuid()],
            'read_at' => fake()->optional(0.3)->dateTimeBetween('-1 month', 'now'),
        ];
    }
}
