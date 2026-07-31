<?php

namespace Database\Seeders;

use App\Models\ActivityLog;
use App\Models\Expense;
use App\Models\Payment;
use App\Models\Task;
use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Database\Seeder;

class BusinessDataSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@example.com')->first();
        if (! $admin) {
            return;
        }

        \App\Models\Employee::factory(10)->create();
        Task::factory(20)->create(['created_by' => $admin->id]);

        $demoEmployee = \App\Models\Employee::where('email', 'employee@example.com')->first();
        if ($demoEmployee) {
            $statuses = \App\Models\TaskStatus::pluck('id', 'code');
            $priorityId = \App\Models\Priority::query()->value('id');

            foreach ([
                ['title' => 'Prepare weekly report', 'code' => 'todo', 'due' => now()->addDays(3)],
                ['title' => 'Update client proposal', 'code' => 'in_progress', 'due' => now()],
                ['title' => 'Review inventory counts', 'code' => 'review', 'due' => now()->subDays(2)],
                ['title' => 'Archive Q1 documents', 'code' => 'done', 'due' => now()->subDays(5)],
                ['title' => 'Follow up with vendor', 'code' => 'todo', 'due' => now()->addDays(7)],
            ] as $demo) {
                Task::query()->firstOrCreate(
                    [
                        'title' => $demo['title'],
                        'assigned_to' => $demoEmployee->id,
                    ],
                    [
                        'description' => 'Demo task assigned for employee workflow testing.',
                        'created_by' => $admin->id,
                        'task_status_id' => $statuses[$demo['code']] ?? $statuses->first(),
                        'priority_id' => $priorityId,
                        'due_date' => $demo['due']->toDateString(),
                        'start_date' => now()->toDateString(),
                    ]
                );
            }
        }

        Payment::factory(15)->create(['created_by' => $admin->id]);
        Expense::factory(15)->create(['created_by' => $admin->id]);
        UserNotification::factory(5)->create(['user_id' => $admin->id]);
        ActivityLog::factory(10)->create(['user_id' => $admin->id]);
    }
}
