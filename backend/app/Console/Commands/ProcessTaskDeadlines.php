<?php

namespace App\Console\Commands;

use App\Models\Task;
use App\Models\TaskStatus;
use App\Models\UserNotification;
use App\Enums\NotificationType;
use App\Services\System\SystemEventService;
use Illuminate\Console\Command;

class ProcessTaskDeadlines extends Command
{
    protected $signature = 'tasks:process-deadlines';

    protected $description = 'Send notifications for approaching and overdue tasks';

    public function handle(SystemEventService $systemEventService): int
    {
        $closedIds = TaskStatus::query()->where('is_closed', true)->pluck('id');
        $today = now()->toDateString();
        $soon = now()->addDay()->toDateString();

        $dueSoon = Task::query()
            ->with(['assignee.user', 'taskStatus'])
            ->whereNotIn('task_status_id', $closedIds)
            ->whereDate('due_date', $soon)
            ->get();

        foreach ($dueSoon as $task) {
            if ($this->alreadyNotified($task, NotificationType::TaskDueSoon)) {
                continue;
            }
            $systemEventService->taskDueSoon($task);
        }

        $overdue = Task::query()
            ->with(['assignee.user', 'taskStatus'])
            ->whereNotIn('task_status_id', $closedIds)
            ->whereDate('due_date', '<', $today)
            ->get();

        foreach ($overdue as $task) {
            if ($this->alreadyNotifiedToday($task, NotificationType::TaskOverdue)) {
                continue;
            }
            $systemEventService->taskOverdue($task);
        }

        $this->info('Processed '.$dueSoon->count().' due-soon and '.$overdue->count().' overdue tasks.');

        return self::SUCCESS;
    }

    private function alreadyNotified(Task $task, NotificationType $type): bool
    {
        $userId = $task->assignee?->user_id;
        if (! $userId) {
            return true;
        }

        return UserNotification::query()
            ->where('user_id', $userId)
            ->where('type', $type->value)
            ->where('data->task_id', $task->id)
            ->whereDate('created_at', now()->toDateString())
            ->exists();
    }

    private function alreadyNotifiedToday(Task $task, NotificationType $type): bool
    {
        return $this->alreadyNotified($task, $type);
    }
}
