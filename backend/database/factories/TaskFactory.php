<?php

namespace Database\Factories;

use App\Models\Department;
use App\Models\Employee;
use App\Models\Priority;
use App\Models\Task;
use App\Models\TaskStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TaskFactory extends Factory
{
    protected $model = Task::class;

    public function definition(): array
    {
        $status = TaskStatus::inRandomOrder()->first();

        return [
            'title' => fake()->sentence(4),
            'description' => fake()->paragraph(),
            'assigned_to' => Employee::inRandomOrder()->value('id'),
            'created_by' => User::inRandomOrder()->value('id'),
            'department_id' => Department::inRandomOrder()->value('id'),
            'task_status_id' => $status?->id,
            'priority_id' => Priority::inRandomOrder()->value('id'),
            'due_date' => fake()->dateTimeBetween('now', '+3 months'),
            'completed_at' => $status?->is_closed ? now() : null,
        ];
    }
}
