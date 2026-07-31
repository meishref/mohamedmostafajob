<?php

namespace Database\Factories;

use App\Models\Employee;
use App\Models\Payment;
use App\Models\PaymentStatus;
use App\Models\PaymentType;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    public function definition(): array
    {
        return [
            'payment_number' => 'PAY-'.fake()->unique()->numerify('######'),
            'employee_id' => Employee::inRandomOrder()->value('id'),
            'payment_type_id' => PaymentType::inRandomOrder()->value('id'),
            'payment_status_id' => PaymentStatus::inRandomOrder()->value('id'),
            'amount' => fake()->randomFloat(2, 500, 15000),
            'currency' => 'USD',
            'payment_date' => fake()->dateTimeBetween('-1 year', 'now'),
            'reference' => fake()->optional()->uuid(),
            'notes' => fake()->optional()->sentence(),
            'created_by' => User::inRandomOrder()->value('id'),
        ];
    }
}
